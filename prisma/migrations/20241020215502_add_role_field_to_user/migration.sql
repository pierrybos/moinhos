/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - Changed the type of `userId` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
-- 1. Criar uma nova coluna com o tipo correto
ALTER TABLE "Booking" ADD COLUMN "newUserId" INT;

-- 2. Copiar os dados da coluna antiga para a nova
UPDATE "Booking" SET "newUserId" = CAST("userId" AS INT);

-- 3. Remover a coluna antiga
ALTER TABLE "Booking" DROP COLUMN "userId";

-- 4. Renomear a nova coluna para "userId"
ALTER TABLE "Booking" RENAME COLUMN "newUserId" TO "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'default';

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
