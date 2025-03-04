import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type DriveConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  accessToken: string;
  expiryDate: number;
  scope: string;
  tokenType: string;
  idToken: string;
  uploadFolderId: string;
  uploadFolderName: string;
};

export async function getInstitutionConfig(institutionSlug: string): Promise<DriveConfig> {
  const institution = await prisma.institution.findFirst({
    where: { slug: institutionSlug },
  });

  if (!institution || !institution.driveConfig) {
    throw new Error('Institution not found or drive config not set');
  }

  const driveConfig = institution.driveConfig as unknown as DriveConfig;

  // Validate the required fields
  if (
    !driveConfig.clientId ||
    !driveConfig.clientSecret ||
    !driveConfig.redirectUri ||
    !driveConfig.refreshToken ||
    !driveConfig.accessToken ||
    !driveConfig.expiryDate ||
    !driveConfig.scope ||
    !driveConfig.tokenType ||
    !driveConfig.idToken ||
    !driveConfig.uploadFolderId ||
    !driveConfig.uploadFolderName
  ) {
    throw new Error('Invalid drive config');
  }

  return driveConfig;
}

export async function updateInstitutionConfig(
  institutionSlug: string,
  driveConfig: DriveConfig
): Promise<void> {
  const institution = await prisma.institution.findFirst({
    where: { slug: institutionSlug },
  });

  if (!institution) {
    throw new Error('Institution not found');
  }

  await prisma.institution.update({
    where: { id: institution.id },
    data: {
      driveConfig: driveConfig as unknown as Prisma.InputJsonValue,
    },
  });
}
