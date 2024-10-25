// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unstable_noStore } from 'next/cache';
import { withRole } from "@/utils/authMiddleware";


const prisma = new PrismaClient();
unstable_noStore();
export const dynamic = "force-dynamic";

export async function GET() {
    const authError = await withRole(req, "manager");
    if (authError) return authError; // Retorna erro de autenticação, se existir

    

    try {
        const bookings = await prisma.booking.findMany({
            where: { isActive: true },
            include: { room: true, department: true, user: true},
        });
        const response = NextResponse.json(bookings);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        return response;
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return NextResponse.json({ error: "Erro ao buscar os agendamentos." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: Request) {
    const authError = await withRole(req, "default");
    if (authError) return authError; // Retorna erro de autenticação, se existir

    try {
        const { roomId, departmentId, startTime, endTime, observation, userId, phone } = await req.json();
        
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                roomId,
                startTime: { lte: new Date(endTime) },
                endTime: { gte: new Date(startTime) },
            },
        });
        
        if (conflictingBooking) {
            return NextResponse.json({ error: "A sala já está ocupada neste horário." }, { status: 400 });
        }
        
        const booking = await prisma.booking.create({
            data: {
                roomId,
                departmentId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                userId,
                observation,
                phone,
                status: "pending",
                isActive: true,
            },
        });
        
        return NextResponse.json(booking);
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return NextResponse.json({ error: "Erro ao criar agendamento." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
