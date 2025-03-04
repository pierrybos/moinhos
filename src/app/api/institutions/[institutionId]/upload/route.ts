import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';

async function findOrCreateFolder(drive: drive_v3.Drive, name: string, parentId: string, shouldFind = true): Promise<string> {
  try {
    if (shouldFind) {
      const response = await drive.files.list({
        q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const files = response.data.files;
      if (files?.[0]?.id) {
        return files[0].id;
      }
    }

    const folder = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });

    if (!folder.data.id) {
      throw new Error('Failed to create folder in Google Drive');
    }

    return folder.data.id;
  } catch (error) {
    throw new Error(`Failed to find or create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function uploadFileToDrive(
  drive: drive_v3.Drive,
  file: File,
  folderId: string,
  description: string
): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        description,
        parents: [folderId],
      },
      media: {
        body: stream,
      },
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });

    if (!response.data.id) {
      throw new Error('Failed to upload file to Google Drive');
    }

    return response.data.id;
  } catch (error) {
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
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

    if (!driveConfig?.serviceAccountKey || !driveConfig?.serviceAccountEmail || !driveConfig?.sharedDriveId) {
      return NextResponse.json(
        { error: 'Drive configuration is incomplete' },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(driveConfig.serviceAccountKey),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const userPhoto = formData.get('userPhoto') as File;
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

    if (!participantName || !churchGroupState || !participationDate || !programPart || !phone || !isWhatsApp || !observations || !imageRightsGranted || !isMember || !performanceType || !microphoneCount || !bibleVersion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [year, month, day] = participationDate.split('-');

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const programFolderName = `${programPart} ${hours}:${minutes}`;

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

    let currentFolderId = driveConfig.sharedDriveId;
    
    currentFolderId = await findOrCreateFolder(drive, year, currentFolderId);
    
    currentFolderId = await findOrCreateFolder(drive, month, currentFolderId);
    
    currentFolderId = await findOrCreateFolder(drive, day, currentFolderId);
    
    const programFolderId = await findOrCreateFolder(drive, programFolderName, currentFolderId, false);

    if (!programFolderId) {
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      );
    }

    const uploadedFiles = [];

    if (userPhoto) {
      const photosFolderId = await findOrCreateFolder(drive, 'fotos', programFolderId);
      if (!photosFolderId) {
        return NextResponse.json(
          { error: 'Failed to create folder' },
          { status: 500 }
        );
      }
      const photoId = await uploadFileToDrive(drive, userPhoto, photosFolderId, description);
      uploadedFiles.push({ type: 'photo', id: photoId });
    }

    if (files.length > 0) {
      const filesFolderId = await findOrCreateFolder(drive, 'arquivos', programFolderId);
      if (!filesFolderId) {
        return NextResponse.json(
          { error: 'Failed to create folder' },
          { status: 500 }
        );
      }
      
      for (const file of files) {
        const fileId = await uploadFileToDrive(drive, file, filesFolderId, description);
        uploadedFiles.push({ type: 'file', id: fileId });
      }
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
