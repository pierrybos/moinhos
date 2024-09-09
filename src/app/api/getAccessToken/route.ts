// app/api/getAccessToken/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
    keyFile: "./src/private/key.json", // Ajuste o caminho conforme necessário
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
