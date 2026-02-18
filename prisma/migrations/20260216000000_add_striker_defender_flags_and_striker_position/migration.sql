-- CreateEnum
CREATE TYPE "StrikerPosition" AS ENUM ('BlueStrikerAtPositionZero', 'RedStrikerAtPositionZero');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "strikerPosition" "StrikerPosition" NOT NULL DEFAULT 'BlueStrikerAtPositionZero';

-- AlterTable
ALTER TABLE "PlayerPoint" ADD COLUMN     "isStriker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDefender" BOOLEAN NOT NULL DEFAULT false;
