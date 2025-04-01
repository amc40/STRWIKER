-- AlterTable
ALTER TABLE "PlayerPoint" ADD COLUMN     "is_defender" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_striker" BOOLEAN NOT NULL DEFAULT false;
