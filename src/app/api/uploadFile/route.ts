// app/api/saveParticipant/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { authenticateGoogle, uploadFolderToDrive } from "@/utils/googleAuth"; // Importando da nova localização
import mime from "mime";
import { Readable } from "stream";

const prisma = new PrismaClient();

// Função para buscar ou criar pasta no Google Drive
const getOrCreateFolder = async (drive, folderName, parentFolderId) => {
    const response = await drive.files.list({
        q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
        spaces: "drive",
    });
    
    if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
    }
    
    const folder = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentFolderId],
        },
        fields: "id",
        supportsAllDrives: true,
    });
    
    return folder.data.id;
};

// Função para criar a estrutura de pastas no Google Drive com base na data
const createFolderStructure = async (drive, date) => {
    const [year, month, day] = date.split("-");
    let parentFolderId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID;
    
    parentFolderId = await getOrCreateFolder(drive, year, parentFolderId);
    parentFolderId = await getOrCreateFolder(drive, month, parentFolderId);
    parentFolderId = await getOrCreateFolder(drive, day, parentFolderId);
    
    return parentFolderId;
};

// Função para upload de arquivos para o Google Drive
const uploadFileToDrive = async (folderId, file) => {
    const auth = authenticateGoogle();
    const drive = google.drive({ version: "v3", auth });
    
    const mimeType = mime.getType(file.name);
    
    const fileMetadata = {
        name: file.name,
        parents: [folderId],
        mimeType: mimeType,
    };
    
    const fileBuffer = file.stream();
    
    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
            mimeType: mimeType!,
            body: Readable.from(fileBuffer),
        },
        fields: "id",
        supportsAllDrives: true,
    });
    
    if (!response.data.id) {
        console.error("Erro ao criar o arquivo: ID não retornado.");
        throw new Error("Erro ao criar o arquivo no Google Drive.");
    }
    
    const fileLink = await drive.files.get({
        fileId: response.data.id,
        fields: "webViewLink",
        supportsAllDrives: true,
    });
    
    if (!fileLink.data.webViewLink) {
        console.error("Erro ao obter o link do arquivo:", fileLink.data);
        throw new Error("Erro ao obter o link do arquivo.");
    }
    
    return fileLink.data;
};

// Manipulador de requisições POST
export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const name = data.get("participantName") as string;
        const group = data.get("churchGroupState") as string;
        const participationDate = data.get("participationDate") as string;
        const programPart = data.get("programPart") as string;
        const observations = data.get("observations") as string;
        const files = data.getAll("files") as File[];
        
        // Autenticação do Google Drive
        const auth = authenticateGoogle();
        const drive = google.drive({ version: "v3", auth });
        
        // Cria ou reutiliza a estrutura de pastas com base na data fornecida
        const folderId = await createFolderStructure(drive, participationDate);
        
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
            const driveLink = await uploadFileToDrive(folderId, file);
            await prisma.file.create({
                data: {
                    filename: file.name,
                    driveLink: driveLink.webViewLink,
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