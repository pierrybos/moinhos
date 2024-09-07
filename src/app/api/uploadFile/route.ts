// src/app/api/uploadFile/route.ts (Exemplo ajustado)
import { NextResponse } from "next/server";
import { google, drive_v3 } from "googleapis";
import { authenticateGoogle } from "@/utils/googleAuth";

// Função para criar ou obter uma pasta no Google Drive
const createOrGetFolder = async (
    drive: drive_v3.Drive,
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
                parents: [parentId], // Garantir que parentId é sempre uma string
            },
            fields: "id",
            supportsAllDrives: true,
        });
        
        // Certifique-se de que o id é sempre retornado como string
        if (!folder.data.id) {
            throw new Error("Falha ao criar a pasta.");
        }
        
        return folder.data.id;
    }
};

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { folderName, parentFolderId } = data;
        
        if (!folderName || !parentFolderId) {
            return NextResponse.json(
                { error: "Nome da pasta e ID da pasta pai são obrigatórios." },
                { status: 400 }
            );
        }
        
        const auth = authenticateGoogle();
        const drive = google.drive({ version: "v3", auth });
        
        // Chama a função para criar ou obter a pasta
        const folderId = await createOrGetFolder(drive, parentFolderId, folderName);
        
        return NextResponse.json({ folderId });
    } catch (error) {
        console.error("Erro ao criar a pasta:", error);
        return NextResponse.json(
            { error: "Erro ao criar a pasta." },
            { status: 500 }
        );
    }
}
