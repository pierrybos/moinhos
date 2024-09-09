// app/api/getParticipants/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unstable_noStore } from 'next/cache';

const prisma = new PrismaClient();
unstable_noStore();
export const dynamic = "force-dynamic"; // Garante que a página seja sempre renderizada dinamicamente


export async function GET() {
    try {
        // Busca todos os participantes e seus arquivos associados
        const participants = await prisma.participant.findMany({
            where: { isActive: true },
            include: {
                files: true,
            },
        });
        console.log('biscando');
        console.log(participants)
        
        const response = NextResponse.json({ participants });
        
        // Adiciona cabeçalhos para evitar o cache
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        
        return response;
    } catch (error) {
        console.error("Erro ao buscar os participantes:", error);
        return NextResponse.json(
            { error: "Erro ao buscar os participantes." },
            { status: 500 }
        );
    } finally {
        // Encerra a conexão para evitar retenção de cache de conexão
        await prisma.$disconnect();
    }
}
