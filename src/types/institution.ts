import { Institution } from '@prisma/client';

export interface DriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  serviceAccountKey: string;
  serviceAccountEmail: string;
  sharedDriveId: string;
  maxMicrophones: number;
  membershipText: string;
  imageRightsText: string;
  bibleVersions: string[];
}

export type InstitutionWithDriveConfig = Omit<Institution, 'driveConfig'> & {
  driveConfig?: DriveConfig;
};
