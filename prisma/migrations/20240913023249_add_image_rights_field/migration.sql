-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "imageRightsGranted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMember" BOOLEAN NOT NULL DEFAULT false;
