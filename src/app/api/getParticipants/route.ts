// app/api/getParticipants/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Busca todos os participantes e seus arquivos associados
        const participants = await prisma.participant.findMany({
            where: { isActive: true },
            include: {
                files: true,
            },
        });
        
        return NextResponse.json({ participants });
    } catch (error) {
        console.error("Erro ao buscar os participantes:", error);
        return NextResponse.json(
            { error: "Erro ao buscar os participantes." },
            { status: 500 }
        );
    }
}
