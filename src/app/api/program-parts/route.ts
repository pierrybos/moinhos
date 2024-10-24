// app/api/program-parts/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRole } from "@/utils/authMiddleware";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Buscar todas as partes do programa ativas
        const parts = await prisma.programPart.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }, // Ordenar por nome
        });
        return NextResponse.json(parts);
    } catch (error) {
        console.error("Erro ao buscar as partes do programa:", error);
        return NextResponse.json(
            { error: "Erro ao buscar as partes do programa." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}

export async function POST(req: Request) {
    const authError = await withRole(req, "admin");
    if (authError) return authError; // Retorna erro de autenticação, se existir

    try {
        const { name } = await req.json();
        const part = await prisma.programPart.create({
            data: { name },
        });
        return NextResponse.json(part);
    } catch (error) {
        console.error("Erro ao adicionar a parte do programa:", error);
        return NextResponse.json(
            { error: "Erro ao adicionar a parte do programa." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}

export async function PATCH(req: Request) {

    const authError = await withRole(req, "admin");
    if (authError) return authError; // Retorna erro de autenticação, se existir

    try {
        const { id, name, isActive } = await req.json();
        const part = await prisma.programPart.update({
            where: { id },
            data: { name, isActive },
        });
        return NextResponse.json(part);
    } catch (error) {
        console.error("Erro ao atualizar a parte do programa:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar a parte do programa." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}

export async function DELETE(req: Request) {

    const authError = await withRole(req, "admin");
    if (authError) return authError; // Retorna erro de autenticação, se existir

    try {
        const { id } = await req.json();
        await prisma.programPart.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Parte do programa removida com sucesso." });
    } catch (error) {
        console.error("Erro ao remover a parte do programa:", error);
        return NextResponse.json(
            { error: "Erro ao remover a parte do programa." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
