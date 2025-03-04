import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const institutionId = parseInt(params.institutionId);

    // Verify user has access to this institution
    const user = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
        institutionId: institutionId,
        role: 'admin',
      },
    });

    if (!user) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Validate required fields
    if (!data.name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate driveConfig fields
    if (!data.driveConfig) {
      return new NextResponse('Missing driveConfig', { status: 400 });
    }

    const updatedInstitution = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        name: data.name,
        driveConfig: data.driveConfig, // Use driveConfig directly from the request
      },
    });

    return NextResponse.json(updatedInstitution);
  } catch (error) {
    console.error('Error updating institution:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
