// app/api/updateStatus/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRole } from "@/utils/authMiddleware";


const prisma = new PrismaClient();

export async function PATCH(req: Request) {

    const authError = await withRole(req, "admin");
    if (authError) return authError; // Retorna erro de autenticação, se existir

    try {
        const { id, status, observations } = await req.json();
        
        // Atualiza o status e as observações do participante no banco de dados
        await prisma.participant.update({
            where: { id },
            data: { 
                status: status || undefined,
                observations: observations || undefined,
            },
        });
        
        return NextResponse.json({ message: "Atualizações salvas com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar o status ou observações:", error);
        return NextResponse.json(
            { error: "Erro ao salvar as atualizações." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
