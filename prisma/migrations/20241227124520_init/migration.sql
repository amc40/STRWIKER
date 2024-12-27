-- CreateEnum
CREATE TYPE "RotatyStrategy" AS ENUM ('Never', 'OnConcede', 'Always');

-- CreateEnum
CREATE TYPE "Team" AS ENUM ('Red', 'Blue');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 1200,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "currentPointId" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "abandoned" BOOLEAN NOT NULL DEFAULT false,
    "finalScoreRed" INTEGER,
    "finalScoreBlue" INTEGER,
    "rotatyRed" "RotatyStrategy" NOT NULL,
    "rotatyBlue" "RotatyStrategy" NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Point" (
    "id" SERIAL NOT NULL,
    "currentRedScore" INTEGER NOT NULL DEFAULT 0,
    "currentBlueScore" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPoint" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL,
    "team" "Team" NOT NULL,
    "scoredGoal" BOOLEAN NOT NULL DEFAULT false,
    "ownGoal" BOOLEAN NOT NULL DEFAULT false,
    "rattled" BOOLEAN NOT NULL DEFAULT false,
    "playerId" INTEGER NOT NULL,
    "pointId" INTEGER NOT NULL,

    CONSTRAINT "PlayerPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalPlayerStats" (
    "id" SERIAL NOT NULL,
    "gamesPlayed" INTEGER NOT NULL,
    "elo" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "HistoricalPlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Game_currentPointId_key" ON "Game"("currentPointId");

-- CreateIndex
CREATE INDEX "Game_startTime_idx" ON "Game"("startTime");

-- CreateIndex
CREATE INDEX "Game_completed_abandoned_idx" ON "Game"("completed", "abandoned");

-- CreateIndex
CREATE INDEX "Point_gameId_idx" ON "Point"("gameId");

-- CreateIndex
CREATE INDEX "Point_gameId_startTime_idx" ON "Point"("gameId", "startTime");

-- CreateIndex
CREATE INDEX "PlayerPoint_playerId_idx" ON "PlayerPoint"("playerId");

-- CreateIndex
CREATE INDEX "PlayerPoint_pointId_idx" ON "PlayerPoint"("pointId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerPoint_playerId_pointId_key" ON "PlayerPoint"("playerId", "pointId");

-- CreateIndex
CREATE INDEX "HistoricalPlayerStats_playerId_idx" ON "HistoricalPlayerStats"("playerId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_currentPointId_fkey" FOREIGN KEY ("currentPointId") REFERENCES "Point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "Point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalPlayerStats" ADD CONSTRAINT "HistoricalPlayerStats_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalPlayerStats" ADD CONSTRAINT "HistoricalPlayerStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
