// app/api/saveParticipant/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        const { participantName, churchGroupState, participationDate, programPart,  phone,
            isWhatsApp, observations, files } = data;
            
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
                },
            });
            
            // Salvar os metadados dos arquivos associados ao participante
            for (const file of files) {
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
        }
    }
    