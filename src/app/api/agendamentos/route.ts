// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unstable_noStore } from 'next/cache';
import { withRole } from "@/utils/authMiddleware";
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();
unstable_noStore();
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
        const session = await getServerSession();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { roomId, departmentId, startTime, endTime, userId, observation, phone, institutionId } = await req.json();

        // Validate required fields
        if (!roomId || !departmentId || !startTime || !endTime || !userId || !institutionId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Validate that the room exists
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return new NextResponse('Room not found', { status: 404 });
        }

        // Validate that the department exists
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
        });

        if (!department) {
            return new NextResponse('Department not found', { status: 404 });
        }

        // Validate that the user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

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

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                room: { connect: { id: roomId } },
                department: { connect: { id: departmentId } },
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                user: { connect: { id: userId } },
                observation,
                phone,
                status: 'pending',
                isActive: true,
                institution: { connect: { id: institutionId } },
            },
            include: {
                room: true,
                department: true,
                user: true,
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
