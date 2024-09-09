const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "./src/private/key.json", // caminho do arquivo JSON da chave
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

async function getAccessToken() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  console.log("Access Token:", accessToken);
}

getAccessToken();
