// app/api/saveParticipant/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { google, drive_v3 } from "googleapis"; // Importando o tipo drive_v3
import { Readable } from "stream";
import mime from "mime"; // Importando mime para identificar o tipo dos arquivos
"@/src/utils/googleAuth";
const prisma = new PrismaClient();

// Função para criar ou obter uma pasta no Google Drive
const createOrGetFolder = async (
    drive: drive_v3.Drive, // Especificando o tipo correto para o Google Drive
    parentId: string,
    folderName: string
): Promise<string> => {
    const folderExists = await drive.files.list({
        q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: "files(id, name)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });
    
    if (folderExists.data.files && folderExists.data.files.length > 0) {
        return folderExists.data.files[0].id!;
    } else {
        const folder = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
                parents: [parentId],
            },
            fields: "id",
            supportsAllDrives: true,
        });
        
        return folder.data.id!;
    }
};

// Função para upload de arquivos para o Google Drive
const uploadFileToDrive = async (
    drive: drive_v3.Drive, // Especificando o tipo correto para o Google Drive
    file: File,
    folderId: string
): Promise<drive_v3.Schema$File> => {
    const fileMetadata = {
        name: file.name,
        parents: [folderId],
    };
    
    // Usando mime para obter o tipo correto do arquivo
    const mimeType = mime.getType(file.name) || file.type;
    
    // Transformando o arquivo em um stream legível usando Readable.from
    const fileStream = Readable.from(Buffer.from(await file.arrayBuffer()));
    
    const media = {
        mimeType: mimeType, // Usando o mimeType corretamente identificado
        body: fileStream,
    };
    
    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
        supportsAllDrives: true,
    });
    
    return response.data;
};

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const name = data.get("participantName") as string;
        const group = data.get("churchGroupState") as string;
        const participationDate = data.get("participationDate") as string;
        const programPart = data.get("programPart") as string; // Captura o programa
        const observations = data.get("observations") as string;
        const files = data.getAll("files") as File[];
        
        const date = new Date(participationDate);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        
        const auth = authenticateGoogle();
        const drive = google.drive({ version: "v3", auth });
        
        // Criação das pastas de ano, mês, dia e programa
        const driveId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID!;
        const yearFolderId = await createOrGetFolder(drive, driveId, year);
        const monthFolderId = await createOrGetFolder(drive, yearFolderId, month);
        const dayFolderId = await createOrGetFolder(drive, monthFolderId, day);
        const programFolderId = await createOrGetFolder(
            drive,
            dayFolderId,
            programPart
        );
        
        // Salvar o participante no banco de dados com status "Pendente"
        const participant = await prisma.participant.create({
            data: {
                name,
                group,
                participationDate: new Date(participationDate),
                programPart,
                observations,
                status: "Pendente",
            },
        });
        
        // Salvar os arquivos e associar ao participante
        for (const file of files) {
            const driveLink = await uploadFileToDrive(drive, file, programFolderId);
            await prisma.file.create({
                data: {
                    filename: file.name,
                    driveLink: driveLink.webViewLink!,
                    participantId: participant.id,
                },
            });
        }
        
        return NextResponse.json({ message: "Dados salvos com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
        return NextResponse.json(
            { error: "Erro ao salvar os dados." },
            { status: 500 }
        );
    }
}
