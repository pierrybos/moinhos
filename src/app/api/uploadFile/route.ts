// app/api/saveParticipant/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { authenticateGoogle } from "@/app/api/createFolder/route";
import mime from "mime";
import { Readable } from "stream";

const prisma = new PrismaClient();

// Função para buscar ou criar pasta no Google Drive
const getOrCreateFolder = async (drive, folderName, parentFolderId) => {
    const response = await drive.files.list({
        q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
        spaces: "drive",
    });
    
    if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
    }
    
    const folder = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentFolderId],
        },
        fields: "id",
        supportsAllDrives: true,
    });
    
    return folder.data.id;
};

// Função para criar a estrutura de pastas no Google Drive com base na data
const createFolderStructure = async (drive, date) => {
    const [year, month, day] = date.split("-");
    let parentFolderId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID;
    
    parentFolderId = await getOrCreateFolder(drive, year, parentFolderId);
    parentFolderId = await getOrCreateFolder(drive, month, parentFolderId);
    parentFolderId = await getOrCreateFolder(drive, day, parentFolderId);
    
    return parentFolderId;
};

// Função para upload de arquivos para o Google Drive
const uploadFileToDrive = async (folderId, file) => {
    const auth = authenticateGoogle();
    const drive = google.drive({ version: "v3", auth });
    
    const mimeType = mime.getType(file.name);
    
    const fileMetadata = {
        name: file.name,
        parents: [folderId],
        mimeType: mimeType,
    };
    
    const fileBuffer = file.stream();
    
    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
            mimeType: mimeType!,
            body: Readable.from(fileBuffer),
        },
        fields: "id",
        supportsAllDrives: true,
    });
    
    if (!response.data.id) {
        console.error("Erro ao criar o arquivo: ID não retornado.");
        throw new Error("Erro ao criar o arquivo no Google Drive.");
    }
    
    const fileLink = await drive.files.get({
        fileId: response.data.id,
        fields: "webViewLink",
        supportsAllDrives: true,
    });
    
    if (!fileLink.data.webViewLink) {
        console.error("Erro ao obter o link do arquivo:", fileLink.data);
        throw new Error("Erro ao obter o link do arquivo.");
    }
    
    return fileLink.data;
};

// Manipulador de requisições POST
export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const name = data.get("participantName") as string;
        const group = data.get("churchGroupState") as string;
        const participationDate = data.get("participationDate") as string;
        const programPart = data.get("programPart") as string;
        const observations = data.get("observations") as string;
        const files = data.getAll("files") as File[];
        
        // Autenticação do Google Drive
        const auth = authenticateGoogle();
        const drive = google.drive({ version: "v3", auth });
        
        // Cria ou reutiliza a estrutura de pastas com base na data fornecida
        const folderId = await createFolderStructure(drive, participationDate);
        
        // Salvar o participante no banco de dados com status "Pendente"
        const participant = await prisma.participant.create({
            data: {
                name,
                group,
                participationDate: new Date(participationDate),
                programPart,
                observations,
                status: "Pendente",
            },
        });
        
        // Salvar os arquivos e associar ao participante
        for (const file of files) {
            const driveLink = await uploadFileToDrive(folderId, file);
            await prisma.file.create({
                data: {
                    filename: file.name,
                    driveLink: driveLink.webViewLink,
                    participantId: participant.id,
                },
            });
        }
        
        return NextResponse.json({ message: "Dados salvos com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
        return NextResponse.json(
            { error: "Erro ao salvar os dados." },
            { status: 500 }
        );
    }
}



/* app/api/uploadFile/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { authenticateGoogle } from "@/app/api/createFolder/route";
import mime from "mime";
import { Readable } from "stream";

// Função para buscar ou criar pasta no Google Drive
const getOrCreateFolder = async (drive, folderName, parentFolderId) => {
// Busca por uma pasta com o nome especificado dentro da pasta pai
const response = await drive.files.list({
q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
fields: "files(id, name)",
spaces: "drive",
});

// Se a pasta existir, retorna o ID
if (response.data.files && response.data.files.length > 0) {
return response.data.files[0].id;
}

// Caso contrário, cria a pasta
const folder = await drive.files.create({
requestBody: {
name: folderName,
mimeType: "application/vnd.google-apps.folder",
parents: [parentFolderId],
},
fields: "id",
supportsAllDrives: true,
});

return folder.data.id;
};

// Função para criar a estrutura de pastas no Google Drive com base na data
const createFolderStructure = async (drive, date) => {
const [year, month, day] = date.split("-");
let parentFolderId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID;

// Reutiliza ou cria as pastas Ano, Mês e Dia
parentFolderId = await getOrCreateFolder(drive, year, parentFolderId);
parentFolderId = await getOrCreateFolder(drive, month, parentFolderId);
parentFolderId = await getOrCreateFolder(drive, day, parentFolderId);

return parentFolderId;
};

// Função para upload de arquivos para o Google Drive
const uploadFileToDrive = async (folderId, file, driveId) => {
const auth = authenticateGoogle();
const drive = google.drive({ version: "v3", auth });

const mimeType = mime.getType(file.name);

const fileMetadata = {
name: file.name,
parents: [folderId],
driveId: driveId,
mimeType: mimeType,
};

const fileBuffer = file.stream();

const response = await drive.files.create({
requestBody: fileMetadata,
media: {
mimeType: mimeType!,
body: Readable.from(fileBuffer),
},
fields: "id",
supportsAllDrives: true,
});

if (!response.data.id) {
console.error("Erro ao criar o arquivo: ID não retornado.");
throw new Error("Erro ao criar o arquivo no Google Drive.");
}

const fileLink = await drive.files.get({
fileId: response.data.id,
fields: "webViewLink",
supportsAllDrives: true,
});

if (!fileLink.data.webViewLink) {
console.error("Erro ao obter o link do arquivo:", fileLink.data);
throw new Error("Erro ao obter o link do arquivo.");
}

return fileLink.data;
};

// Manipulador de requisições POST
export async function POST(req: Request) {
try {
const res = await req.formData();
const participationDate = res.get("participationDate") as string;
const files = res.getAll("files") as File[];

if (!participationDate || files.length === 0) {
return NextResponse.json(
{
error: "Data de participação ou arquivos faltando.",
},
{
status: 400,
}
);
}

const auth = authenticateGoogle();
const drive = google.drive({ version: "v3", auth });

// Cria ou reutiliza a estrutura de pastas com base na data fornecida
const folderId = await createFolderStructure(drive, participationDate);

// Faz o upload de cada arquivo na pasta criada
for (const file of files) {
await uploadFileToDrive(folderId, file, process.env.NEXT_PUBLIC_SHARED_DRIVE_ID!);
}

return NextResponse.json(
{
message: "Arquivos enviados com sucesso!",
},
{
status: 200,
}
);
} catch (error) {
console.error("Erro ao fazer upload dos arquivos:", error);
return NextResponse.json(
{
error: "Erro ao fazer upload dos arquivos.",
},
{
status: 500,
}
);
}
}





/* app/api/uploadFile/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { authenticateGoogle } from "@/app/api/createFolder/route";
import mime from "mime";
import { Readable } from "stream";

// Função para criar estrutura de pastas no Google Drive com base na data
const createFolderStructure = async (drive, date) => {
const [year, month, day] = date.split("-");
let parentFolderId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID;

const folders = [year, month, day];
for (const folderName of folders) {
const folder = await drive.files.create({
requestBody: {
name: folderName,
mimeType: "application/vnd.google-apps.folder",
parents: [parentFolderId],
},
fields: "id",
supportsAllDrives: true,
});

parentFolderId = folder.data.id;

if (!parentFolderId) {
console.error(`Erro ao criar pasta: ${folderName}`);
throw new Error(`Erro ao criar pasta: ${folderName}`);
}
}

return parentFolderId;
};

// Função para upload de arquivos para o Google Drive
const uploadFileToDrive = async (folderId, file, driveId) => {
const auth = authenticateGoogle();
const drive = google.drive({ version: "v3", auth });

const mimeType = mime.getType(file.name);

const fileMetadata = {
name: file.name,
parents: [folderId],
driveId: driveId,
mimeType: mimeType,
};

const fileBuffer = file.stream();

const response = await drive.files.create({
requestBody: fileMetadata,
media: {
mimeType: mimeType!,
body: Readable.from(fileBuffer),
},
fields: "id",
supportsAllDrives: true,
});

if (!response.data.id) {
console.error("Erro ao criar o arquivo: ID não retornado.");
throw new Error("Erro ao criar o arquivo no Google Drive.");
}

const fileLink = await drive.files.get({
fileId: response.data.id,
fields: "webViewLink",
supportsAllDrives: true,
});

if (!fileLink.data.webViewLink) {
console.error("Erro ao obter o link do arquivo:", fileLink.data);
throw new Error("Erro ao obter o link do arquivo.");
}

return fileLink.data;
};

// Manipulador de requisições POST
export async function POST(req: Request) {
try {
const res = await req.formData();
const participationDate = res.get("participationDate") as string;
const files = res.getAll("files") as File[];

if (!participationDate || files.length === 0) {
return NextResponse.json(
{
error: "Data de participação ou arquivos faltando.",
},
{
status: 400,
}
);
}

const auth = authenticateGoogle();
const drive = google.drive({ version: "v3", auth });

// Cria a estrutura de pastas com base na data fornecida
const folderId = await createFolderStructure(drive, participationDate);

// Faz o upload de cada arquivo na pasta criada
for (const file of files) {
await uploadFileToDrive(folderId, file, process.env.NEXT_PUBLIC_SHARED_DRIVE_ID!);
}

return NextResponse.json(
{
message: "Arquivos enviados com sucesso!",
},
{
status: 200,
}
);
} catch (error) {
console.error("Erro ao fazer upload dos arquivos:", error);
return NextResponse.json(
{
error: "Erro ao fazer upload dos arquivos.",
},
{
status: 500,
}
);
}
}


/* import { NextResponse } from "next/server";
import { google } from "googleapis";
import { authenticateGoogle } from "@/app/api/createFolder/route";
import mime from "mime";
import { Readable } from "stream";

// Função para upload de arquivos para o Google Drive
const uploadFileToDrive = async (
folderId: string,
file: any,
driveId: string
) => {
const auth = authenticateGoogle();
const drive = google.drive({ version: "v3", auth });

const mimeType = mime.getType(file.name);

const fileMetadata = {
name: file.name,
parents: [folderId],
driveId: driveId,
mimeType: mimeType,
};

const fileBuffer = file.stream();

// Criação do arquivo no Google Drive
const response = await drive.files.create({
requestBody: fileMetadata,
media: {
mimeType: mimeType!,
body: Readable.from(fileBuffer),
},
fields: "id", // Apenas retorna o ID do arquivo
supportsAllDrives: true, // Necessário para suportar Drives compartilhados
});

// Verifique se o ID do arquivo foi retornado corretamente
if (!response.data.id) {
console.error("Erro ao criar o arquivo: ID não retornado.");
throw new Error("Erro ao criar o arquivo no Google Drive.");
}

// Obtenha o link de visualização do arquivo
const fileLink = await drive.files.get({
fileId: response.data.id,
fields: "webViewLink",
supportsAllDrives: true,
});

// Verifique se o link está presente
if (!fileLink.data.webViewLink) {
console.error("Erro ao obter o link do arquivo:", fileLink.data);
throw new Error("Erro ao obter o link do arquivo.");
}

return fileLink.data;
};

// Manipulador de requisições POST
export async function POST(req: Request) {
try {
const res = await req.formData();
console.log(res);
const folderId = res.get("folderId") as string;
const driveId = res.get("driveId") as string;
const file = res.get("file") as File;

if (!folderId || !driveId || !file) {
return NextResponse.json(
{
error: "Missing folderId, driveId, or file",
},
{
status: 401,
}
);
}

const fileLink = await uploadFileToDrive(folderId, file, driveId);

return NextResponse.json(
{
fileLink,
},
{
status: 200,
}
);
} catch (error) {
console.error("Erro ao fazer upload do arquivo:", error);
return NextResponse.json(
{
error: "Erro ao fazer upload do arquivo.",
},
{
status: 500,
}
);
}
}
*/