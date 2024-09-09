// app/api/participants/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const participantId = parseInt(params.id, 10);
    
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
    }
}
