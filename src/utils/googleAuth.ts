// src/utils/googleAuth.ts
import { google } from "googleapis";

export const authenticateGoogle = () => {
    
    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
    const clientEmail = process.env.NEXT_PUBLIC_CLIENT_EMAIL;
    const clientId = process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_CLIENT_ID;
    
    // Verificação se todas as variáveis de ambiente estão definidas
    if (!privateKey || !clientEmail || !clientId) {
        throw new Error("As credenciais do Google não estão definidas corretamente.");
    }
    
    const auth = new google.auth.GoogleAuth({
        credentials: {
            type: "service_account",
            private_key: privateKey.replace(/\\n/g, '\n')!,
            client_email: clientEmail,
            client_id: clientId,
        },
        scopes: "https://www.googleapis.com/auth/drive",
    });
    
    return auth;
};



export const uploadFolderToDrive = async (folderId: string, folderName: string) => {
    const auth = authenticateGoogle();
    const drive = google.drive({ version: "v3", auth });
    
    const folder = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [folderId],
            driveId: folderId,
        },
        supportsAllDrives: true, // required to allow folders to be created in shared drives
    });
    
    return {
        folder: folder,
    };
};