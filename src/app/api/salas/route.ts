// app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unstable_noStore } from 'next/cache';

const prisma = new PrismaClient();
unstable_noStore();
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const rooms = await prisma.room.findMany();
        const response = NextResponse.json(rooms);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        return response;
    } catch (error) {
        console.error("Erro ao buscar salas:", error);
        return NextResponse.json({ error: "Erro ao buscar salas." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: Request) {
    try {
        const { name, capacity } = await req.json();
        const room = await prisma.room.create({
            data: { name, capacity },
        });
        return NextResponse.json(room);
    } catch (error) {
        console.error("Erro ao criar sala:", error);
        return NextResponse.json({ error: "Erro ao criar sala." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, capacity } = await req.json();
        const room = await prisma.room.update({
            where: { id },
            data: { name, capacity },
        });
        return NextResponse.json(room);
    } catch (error) {
        console.error("Erro ao atualizar sala:", error);
        return NextResponse.json({ error: "Erro ao atualizar sala." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.room.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Sala excluída com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir sala:", error);
        return NextResponse.json({ error: "Erro ao excluir sala." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
