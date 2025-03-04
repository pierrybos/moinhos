import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { institutionId: string; userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: params.institutionId },
    });

    if (!institution) {
      return new NextResponse('Institution not found', { status: 404 });
    }

    // Verifica se o usuário é admin da instituição
    const adminUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        institutionId: institution.id,
        role: 'admin',
      },
    });

    if (!adminUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Aprova o usuário
    const userId = parseInt(params.userId);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error approving user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
