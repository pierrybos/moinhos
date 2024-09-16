// app/api/saveParticipant/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAllExtensions } from "../../utils/fileExtensions"; // ajuste o caminho conforme necessário

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        const { files } = data;
        const allowedExtensions = getAllExtensions();
        
        const {
            participantName,
            churchGroupState,
            participationDate,
            programPart,
            phone,
            isWhatsApp,
            observations,
            files,
            imageRightsGranted,
            isMember,
            performanceType,  // Novo campo
            microphoneCount,  // Novo campo
        } = data;
        
        // Salvar o participante no banco de dados com status "Pendente"
        const participant = await prisma.participant.create({
            data: {
                name: participantName,
                group: churchGroupState,
                participationDate: new Date(participationDate),
                programPart,
                phone,
                isWhatsApp,
                observations,
                status: "Pendente",
                isMember,
                imageRightsGranted: imageRightsGranted || isMember,
                performanceType,  // Armazenando o tipo de apresentação
                microphoneCount,  // Armazenando a quantidade de microfones, pode ser null se não aplicável
            },
        });
        
        // Salvar os metadados dos arquivos associados ao participante
        for (const file of files) {
            const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                return NextResponse.json(
                    { error: `Arquivo com extensão ${fileExtension} não é permitido.` },
                    { status: 400 }
                );
            }
            await prisma.file.create({
                data: {
                    filename: file.name,
                    driveLink: file.link,
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
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
