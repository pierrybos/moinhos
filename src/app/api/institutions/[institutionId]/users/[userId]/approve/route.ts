import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { institutionId: string; userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const institution = await prisma.institution.findUnique({
      where: { slug: params.institutionId },
    });

    if (!institution) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const adminUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        role: 'admin',
      },
    });

    if (!adminUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const userId = parseInt(params.userId);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: true,
        institutionId: institution.id,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
