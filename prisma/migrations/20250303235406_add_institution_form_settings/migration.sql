-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "imageRightsText" TEXT NOT NULL DEFAULT 'Autorizo o uso da minha imagem',
ADD COLUMN     "maxMicrophones" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "membershipText" TEXT NOT NULL DEFAULT 'Declaro que sou membro desta instituição';
