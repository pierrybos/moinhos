import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { institutionId: string } }
) {
  try {
    const institution = await prisma.institution.findFirst({
      where: {
        slug: params.institutionId,
      },
      select: {
        driveConfig: true,
      },
    });

    if (!institution) {
      return NextResponse.json(
        {
          error: 'Institution not found',
        },
        { status: 404 }
      );
    }

    // Get settings from driveConfig
    const driveConfig = institution.driveConfig as any;
    const settings = {
      maxMicrophones: typeof driveConfig.maxMicrophones === 'number' ? driveConfig.maxMicrophones : 5,
      membershipText: driveConfig.membershipText || "Declaro que sou membro desta instituição",
      imageRightsText: driveConfig.imageRightsText || "Autorizo o uso da minha imagem",
      bibleVersions: driveConfig.bibleVersions || ["NVI", "ACF", "ARA"],
      driveConfig: driveConfig,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching institution settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
