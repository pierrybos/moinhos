// app/api/getAccessToken/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

// Verifica se as credenciais estão disponíveis
const googleDriveKeyJson = process.env.GOOGLE_DRIVE_KEY_JSON
? JSON.parse(process.env.GOOGLE_DRIVE_KEY_JSON)
: null;

if (!googleDriveKeyJson) {
    console.error("Google Drive credentials are missing or invalid.");
}

const auth = new google.auth.GoogleAuth({
    credentials: googleDriveKeyJson, // Usa as credenciais diretamente do JSON parseado
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

export async function GET() {
    try {
        if (!googleDriveKeyJson) {
            return NextResponse.json(
                { error: "Google Drive credentials are missing." },
                { status: 500 }
            );
        }
        
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse?.token;
        
        if (!accessToken) {
            return NextResponse.json(
                { error: "Failed to retrieve access token" },
                { status: 500 }
            );
        }
        
        return NextResponse.json({ accessToken });
    } catch (error) {
        console.error("Error fetching access token:", error);
        
        if (error instanceof Error) {
            
            return NextResponse.json(
                { error: "Could not fetch access token", details: error.message },
                { status: 500 }
            );
        }
        
        // Caso o erro não seja uma instância de Error
        return NextResponse.json(
            { error: "Could not fetch access token", details: "Unknown error occurred" },
            { status: 500 }
        );
    }
}
