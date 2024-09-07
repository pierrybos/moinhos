import { google } from "googleapis";
import { NextResponse } from "next/server";
import { authenticateGoogle, uploadFolderToDrive } from "@/utils/googleAuth"; // Importando da nova localização


const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const clientEmail = process.env.NEXT_PUBLIC_CLIENT_EMAIL;
const serviceAccountClientId =
process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_CLIENT_ID;



export async function POST(req: Request) {
    const res = await req.json();
    
    const { folderId, folderName } = res;
    
    const { folder } = await uploadFolderToDrive(folderId, folderName);
    
    return NextResponse.json(
        {
            folder,
        },
        {
            status: 200,
        }
    );
}
