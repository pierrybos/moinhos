import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { DriveConfig } from '@/types/institution';
import { Prisma } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const institutionId = parseInt(params.institutionId);

    // Verify user has access to this institution
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
        institutionId,
        role: 'admin',
      },
    });

    if (!user) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Validate required fields
    if (!data.name || !data.driveConfig) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const driveConfig = data.driveConfig as DriveConfig;
    if (!driveConfig.clientId || !driveConfig.clientSecret || !driveConfig.redirectUri) {
      return new NextResponse('Missing required driveConfig fields', { status: 400 });
    }

    const updatedInstitution = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        name: data.name,
        driveConfig: JSON.parse(JSON.stringify(driveConfig)) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(updatedInstitution);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
