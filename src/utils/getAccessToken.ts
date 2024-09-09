// utils/getAccessToken.ts
import { google } from "googleapis";

const googleDriveKeyJson = JSON.parse(process.env.GOOGLE_DRIVE_KEY_JSON || "{}");

const auth = new google.auth.GoogleAuth({
  credentials: googleDriveKeyJson, // Usa as credenciais diretamente do JSON parseado
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

export async function getAccessToken() {
  try {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse?.token;
    if (!accessToken) {
      throw new Error("Failed to retrieve access token");
    }
    return accessToken;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw new Error("Could not fetch access token");
  }
}
