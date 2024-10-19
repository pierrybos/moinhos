// app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const bookingId = parseInt(params.id);
    const { status, observation, phone, isActive } = await req.json();
    
    try {
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status, observation, phone, isActive },
        });
        
        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        return NextResponse.json({ error: "Erro ao atualizar agendamento." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
