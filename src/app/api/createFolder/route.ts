import { NextResponse } from "next/server";
import { uploadFolderToDrive } from "@/utils/googleAuth"; // Importando da nova localização
import { withRole } from "@/utils/authMiddleware";


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
