import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';

async function findOrCreateFolder(drive: any, name: string, parentId: string, shouldFind: boolean = true) {
  try {
    if (shouldFind) {
      // Procura pasta existente
      const response = await drive.files.list({
        q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }
    }

    // Cria nova pasta
    const folderMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
      driveId: parentId,
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
      supportsAllDrives: true,
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error in findOrCreateFolder:', error);
    throw error;
  }
}

async function uploadFileToDrive(drive: any, file: File, folderId: string, description: string, driveId: string) {
  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);

  // Upload to Google Drive na pasta correta
  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      description: description,
      parents: [folderId],
      driveId: driveId,
      supportsAllDrives: true,
    },
    media: {
      body: stream,
    },
    supportsAllDrives: true,
  });

  return response.data.id;
}

export async function POST(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
    // Get institution
    const institution = await prisma.institution.findUnique({
      where: { slug: params.institutionId },
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    const driveConfig = institution.driveConfig as {
      serviceAccountKey: string;
      serviceAccountEmail: string;
      sharedDriveId: string;
    };

    // Set up Google Drive client with service account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(driveConfig.serviceAccountKey),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const userPhoto = formData.get('userPhoto') as File;
    
    // Get other form fields
    const participantName = formData.get('participantName') as string;
    const churchGroupState = formData.get('churchGroupState') as string;
    const participationDate = formData.get('participationDate') as string;
    const programPart = formData.get('programPart') as string;
    const phone = formData.get('phone') as string;
    const isWhatsApp = formData.get('isWhatsApp') as string;
    const observations = formData.get('observations') as string;
    const imageRightsGranted = formData.get('imageRightsGranted') as string;
    const isMember = formData.get('isMember') as string;
    const performanceType = formData.get('performanceType') as string;
    const microphoneCount = formData.get('microphoneCount') as string;
    const bibleVersion = formData.get('bibleVersion') as string;

    if (!files.length && !userPhoto) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Convertendo a string da data para o formato correto considerando o timezone local
    const [year, month, day] = participationDate.split('-');

    // Obter hora atual para o nome da pasta
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // Nome da pasta do programa com horário
    const programFolderName = `${programPart} ${hours}:${minutes}`;

    // Create description with all form data
    const description = `
Participante: ${participantName}
Grupo/Igreja: ${churchGroupState}
Data da Participação: ${participationDate}
Parte do Programa: ${programPart}
Tipo de Apresentação: ${performanceType}
Quantidade de Microfones: ${microphoneCount}
Versão da Bíblia: ${bibleVersion}
Telefone: ${phone}
WhatsApp: ${isWhatsApp === 'true' ? 'Sim' : 'Não'}
Membro: ${isMember === 'true' ? 'Sim' : 'Não'}
Direitos de Imagem: ${imageRightsGranted === 'true' ? 'Sim' : 'Não'}
Observações: ${observations}
    `.trim();

    // Criar estrutura de diretórios
    let currentFolderId = driveConfig.sharedDriveId;
    
    // Criar ou encontrar pasta do ano
    currentFolderId = await findOrCreateFolder(drive, year, currentFolderId);
    
    // Criar ou encontrar pasta do mês
    currentFolderId = await findOrCreateFolder(drive, month, currentFolderId);
    
    // Criar ou encontrar pasta do dia
    currentFolderId = await findOrCreateFolder(drive, day, currentFolderId);
    
    // Criar nova pasta da parte do programa (sempre cria uma nova)
    const programFolderId = await findOrCreateFolder(drive, programFolderName, currentFolderId, false);

    const uploadedFiles = [];

    // Upload da foto do usuário se existir
    if (userPhoto) {
      // Criar pasta de fotos
      const photosFolderId = await findOrCreateFolder(drive, 'fotos', programFolderId);
      const photoId = await uploadFileToDrive(drive, userPhoto, photosFolderId, description, driveConfig.sharedDriveId);
      uploadedFiles.push({ type: 'photo', id: photoId });
    }

    // Upload dos outros arquivos
    if (files.length > 0) {
      // Criar pasta de arquivos
      const filesFolderId = await findOrCreateFolder(drive, 'arquivos', programFolderId);
      
      for (const file of files) {
        const fileId = await uploadFileToDrive(drive, file, filesFolderId, description, driveConfig.sharedDriveId);
        uploadedFiles.push({ type: 'file', id: fileId });
      }
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
