// src/utils/googleDriveUpload.ts
import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';

const googleDriveKeyJson = JSON.parse(process.env.GOOGLE_DRIVE_KEY_JSON || "{}");

const auth = new google.auth.GoogleAuth({
    credentials: googleDriveKeyJson, // Usa as credenciais diretamente do JSON parseado
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Função para fazer upload de arquivo
export const uploadFileToDrive = async (file: File, folderId: string) => {
    try {
        const fileStream = Readable.from(Buffer.from(await file.arrayBuffer()));
        
        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [folderId],
            },
            media: {
                mimeType: file.type,
                body: fileStream,
            },
            fields: 'id, webViewLink',
        });
        
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer upload para o Google Drive:', error);
        throw new Error('Falha no upload para o Google Drive');
    }
};
