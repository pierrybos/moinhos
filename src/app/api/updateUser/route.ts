// app/api/updateUser/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
    try {
        const { id, isAdmin } = await req.json();
        
        // Atualiza o status de administrador do usuário
        await prisma.user.update({
            where: { id },
            data: { isAdmin },
        });
        
        return NextResponse.json({ message: "Permissão atualizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar a permissão do usuário:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar a permissão." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
