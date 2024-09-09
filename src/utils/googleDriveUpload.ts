// src/utils/googleDriveUpload.ts
import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';

// Função para autenticar e obter o cliente do Google Drive
const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve('../private/key.json'), // Substitua pelo caminho correto do seu arquivo JSON
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
