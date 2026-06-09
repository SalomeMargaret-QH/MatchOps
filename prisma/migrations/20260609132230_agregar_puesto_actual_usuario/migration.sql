-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentRole" TEXT,
ALTER COLUMN "isCurrentlyWorking" SET DEFAULT false;
