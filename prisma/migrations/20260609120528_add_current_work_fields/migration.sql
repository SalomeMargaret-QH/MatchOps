-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "currentCompany" TEXT,
ADD COLUMN     "isCurrentlyWorking" BOOLEAN DEFAULT false;
