'use server';

import { $Enums, Game, Player, PlayerPoint } from '@prisma/client';
import prisma from './planetscale';

export interface PlayerPointWithPlayer extends PlayerPoint {
  player: Player;
}

export interface PlayerInfo {
  id: number;
  name: string;
  team: $Enums.Team;
}

export const playerPointWithPlayerToPlayerInfo = (
  playerPoint: PlayerPointWithPlayer
): PlayerInfo => ({
  id: playerPoint.playerId,
  name: playerPoint.player.name,
  team: playerPoint.team
});

export interface GameInfo {
  players: PlayerInfo[];
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
    players: currentPointPlayers.map(playerPointWithPlayerToPlayerInfo),
    redScore: currentPoint.currentRedScore,
    blueScore: currentPoint.currentBlueScore
  };
};

// TODO: account for new games. Could we filter by completed:false with a partial index?
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

export const clearCurrentGamePlayers = async () => {
  const currentGame = await getCurrentGame();
  if (currentGame.currentPointId === null) {
    throw new Error('current point id is null');
  }
  await prisma.playerPoint.deleteMany({
    where: {
      pointId: currentGame.currentPointId
    }
  });
};
