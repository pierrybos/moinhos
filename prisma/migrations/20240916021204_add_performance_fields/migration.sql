-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "microphoneCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "performanceType" TEXT NOT NULL DEFAULT 'Solo';
