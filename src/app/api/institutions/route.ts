import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
