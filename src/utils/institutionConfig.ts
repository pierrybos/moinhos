import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  folderId: string;
}

export async function getInstitutionConfig(institutionSlug: string) {
  const institution = await prisma.institution.findUnique({
    where: { slug: institutionSlug },
  });

  if (!institution) {
    throw new Error(`Institution not found: ${institutionSlug}`);
  }

  return {
    driveConfig: institution.driveConfig as DriveConfig,
    name: institution.name,
    id: institution.id,
  };
}

export async function updateInstitutionConfig(
  institutionId: number,
  config: Partial<DriveConfig>
) {
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!institution) {
    throw new Error(`Institution not found: ${institutionId}`);
  }

  const updatedConfig = {
    ...institution.driveConfig,
    ...config,
  };

  return prisma.institution.update({
    where: { id: institutionId },
    data: {
      driveConfig: updatedConfig,
    },
  });
}
