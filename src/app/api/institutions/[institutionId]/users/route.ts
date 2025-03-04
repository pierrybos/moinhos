import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const institution = await prisma.institution.findUnique({
      where: { slug: params.institutionId },
    });

    if (!institution) {
      return new NextResponse('Institution not found', { status: 404 });
    }

    // Verifica se o usuário é admin da instituição
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        institutionId: institution.id,
        role: 'admin',
      },
    });

    if (!user) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { institutionId: institution.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
      },
    });

    // Mapeia os IDs para userId para manter consistência na API
    const mappedUsers = users.map(user => ({
      ...user,
      userId: user.id,
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
