// app/api/participants/[participantId]/deleteParticipant/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRole } from "@/utils/authMiddleware";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { participantId: string } }) {

    const authError = await withRole(req, "admin");
    if (authError) return authError; // Retorna erro de autenticação, se existir


    const participantId = parseInt(params.participantId, 10);
    
    if (isNaN(participantId)) {
        return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }
    
    try {
        // Atualiza o campo `isActive` para `false`, desativando o participante
        const updatedParticipant = await prisma.participant.update({
            where: { id: participantId },
            data: { isActive: false }, // Atualiza o campo `isActive` para realizar a exclusão lógica
        });
        
        return NextResponse.json({
            message: "Participante desativado com sucesso.",
            participant: updatedParticipant,
        });
    } catch (error) {
        console.error("Erro ao desativar o participante:", error);
        return NextResponse.json(
            { error: "Erro ao desativar o participante." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
