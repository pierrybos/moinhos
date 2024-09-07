// src/utils/googleAuth.ts
import { google } from "googleapis";

export const authenticateGoogle = () => {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            type: "service_account",
            private_key: process.env.NEXT_PUBLIC_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
            client_email: process.env.NEXT_PUBLIC_CLIENT_EMAIL!,
            client_id: process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_CLIENT_ID!,
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