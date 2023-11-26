'use server';

import { $Enums, Game, Player, PlayerPoint } from '@prisma/client';
import prisma from './planetscale';
import { GameLogicService } from '../app/services/gameLogicService';
import {
  getCurrentPoint,
  getCurrentPointFromGame
} from '../app/repository/pointRepository';
import { getMaxPlayerPointPositionForTeaminCurrentPoint } from '../app/repository/playerPointRepository';
import { getCurrentGame } from '../app/repository/gameRepository';

export interface PlayerPointWithPlayer extends PlayerPoint {
  player: Player;
}

export interface PlayerInfo {
  id: number;
  name: string;
  team: $Enums.Team;
  position: number;
}

export const playerPointWithPlayerToPlayerInfo = ({
  playerId,
  team,
  position,
  player
}: PlayerPointWithPlayer): PlayerInfo => ({
  id: playerId,
  name: player.name,
  team: team,
  position
});

export interface GameInfo {
  players: PlayerInfo[];
  redScore: number;
  blueScore: number;
}

export const getCurrentGameInfo = async (): Promise<GameInfo> => {
  const currentGame = await getCurrentGame();
  const currentPoint = await getCurrentPointFromGame(currentGame);
  console.log(`Current Point: ${JSON.stringify(currentPoint)}`);
  if (!currentPoint) {
    throw new Error('current point not found');
  }
  const currentPointPlayers = await prisma.playerPoint.findMany({
    where: {
      pointId: currentPoint.id
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

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team
) => {
  const currentGame = await getCurrentGame();
  if (currentGame.currentPointId === null) {
    throw new Error('current point id is null');
  }
  const position =
    ((await getMaxPlayerPointPositionForTeaminCurrentPoint(team)) ?? -1) + 1;
  await prisma.playerPoint.create({
    data: {
      ownGoal: false,
      position,
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

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean
) => {
  const gameLogicService = new GameLogicService();

  const currentGame = await getCurrentGame();

  const currentPoint = await getCurrentPointFromGame(currentGame);

  const playerPoint = await prisma.playerPoint.findFirstOrThrow({
    where: {
      playerId: scorerInfo.id,
      pointId: currentPoint.id
    }
  });

  await gameLogicService.scoreGoal(
    playerPoint,
    ownGoal,
    currentPoint,
    currentGame
  );
};
