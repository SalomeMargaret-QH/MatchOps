/*
  Warnings:

  - You are about to drop the column `currentCompany` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrentlyWorking` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "currentCompany",
DROP COLUMN "isCurrentlyWorking";
