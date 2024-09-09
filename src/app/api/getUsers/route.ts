// app/api/getUsers/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuários." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
