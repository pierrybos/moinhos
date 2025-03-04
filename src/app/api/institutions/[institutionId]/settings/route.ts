import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DriveConfig } from '@/types/institution';

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
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    const driveConfig = institution.driveConfig as unknown as DriveConfig;
    const settings = {
      maxMicrophones: driveConfig?.maxMicrophones ?? 5,
      membershipText: driveConfig?.membershipText ?? "Declaro que sou membro desta instituição",
      imageRightsText: driveConfig?.imageRightsText ?? "Autorizo o uso da minha imagem",
      bibleVersions: driveConfig?.bibleVersions ?? ["NVI", "ACF", "ARA"],
      driveConfig: driveConfig ?? {},
    };

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
