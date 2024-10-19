// app/api/departments/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unstable_noStore } from 'next/cache';

const prisma = new PrismaClient();
unstable_noStore();
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const departments = await prisma.department.findMany();
        const response = NextResponse.json(departments);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        return response;
    } catch (error) {
        console.error("Erro ao buscar departamentos:", error);
        return NextResponse.json({ error: "Erro ao buscar os departamentos." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        const department = await prisma.department.create({
            data: { name },
        });
        return NextResponse.json(department);
    } catch (error) {
        console.error("Erro ao criar departamento:", error);
        return NextResponse.json({ error: "Erro ao criar departamento." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name } = await req.json();
        const department = await prisma.department.update({
            where: { id },
            data: { name },
        });
        return NextResponse.json(department);
    } catch (error) {
        console.error("Erro ao atualizar departamento:", error);
        return NextResponse.json({ error: "Erro ao atualizar departamento." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.department.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Departamento excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir departamento:", error);
        return NextResponse.json({ error: "Erro ao excluir departamento." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
