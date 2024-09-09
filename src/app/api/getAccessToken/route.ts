// app/api/getAccessToken/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";


const googleDriveKeyJson = JSON.parse(process.env.GOOGLE_DRIVE_KEY_JSON || "{}");

const auth = new google.auth.GoogleAuth({
    credentials: googleDriveKeyJson, // Usa as credenciais diretamente do JSON parseado
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

export async function GET() {
    try {
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse?.token;
        
        if (!accessToken) {
            return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 });
        }
        
        return NextResponse.json({ accessToken });
    } catch (error) {
        console.error("Error fetching access token:", error);
        return NextResponse.json({ error: "Could not fetch access token" }, { status: 500 });
    }
}
