'use server';

import { $Enums, Game, Player, PlayerPoint } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import prisma from './planetscale';

export interface PlayerPointWithPlayer extends PlayerPoint {
  player: Player;
}

export interface GameInfo {
  playerPoints: PlayerPointWithPlayer[];
  redScore: number;
  blueScore: number;
}

export const getCurrentGameInfo = async (): Promise<GameInfo> => {
  const currentGame = await getCurrentGame();
  const currentPoint = await prisma.point.findFirst({
    where: {
      gameId: currentGame.id
    },
    orderBy: {
      startTime: 'desc'
    }
  });
  if (!currentPoint) {
    throw new Error('current point not found');
  }
  const currentPointPlayers = await prisma.playerPoint.findMany({
    where: {
      pointId: currentGame.id
    },
    include: {
      player: true
    }
  });
  return {
    playerPoints: currentPointPlayers,
    redScore: currentPoint.currentRedScore,
    blueScore: currentPoint.currentBlueScore
  };
};

export const getCurrentGame = async (): Promise<Game> => {
  const currentGame = await prisma.game.findFirst({
    orderBy: {
      startTime: 'desc'
    }
  });
  if (!currentGame) {
    throw new Error('current game not found');
  }

  return currentGame;
};

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team
) => {
  const currentGame = await getCurrentGame();
  if (currentGame.currentPointId === null) {
    throw new Error('current point id is null');
  }
  await prisma.playerPoint.create({
    data: {
      ownGoal: false,
      position: 0,
      rattled: false,
      scoredGoal: false,
      team,
      playerId,
      pointId: currentGame.currentPointId
    }
  });
};
