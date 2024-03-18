'use server';

import {
  $Enums,
  Player,
  PlayerPoint,
  RotatyStrategy,
  Team
} from '@prisma/client';
import prisma from './planetscale';
import { GameLogicService } from '../app/services/gameLogicService';
import {
  getCurrentPointFromGameOrThrow,
  getCurrentPointIdFromGameOrThrow
} from '../app/repository/pointRepository';
import {
  deletePlayerPoint,
  getAllPlayerPointsForPlayerInCurrentGame,
  getCurrentPlayerPointForPlayerOrThrow,
  getMaxPlayerPointPositionForTeaminCurrentPoint
} from '../app/repository/playerPointRepository';
import {
  getCurrentGame,
  getCurrentGameOrThrow,
  updateRotatyStrategy
} from '../app/repository/gameRepository';
import { RotationService } from '../app/services/rotationService';

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

export type NotInProgressGameInfo = {
  gameInProgress: false;
};

export type InProgressGameInfo = {
  players: PlayerInfo[];
  redScore: number;
  blueScore: number;
  gameInProgress: true;
};

export type GameInfo = NotInProgressGameInfo | InProgressGameInfo;

export const getCurrentGameInfo = async (): Promise<GameInfo> => {
  const currentGame = await getCurrentGame();

  if (currentGame == null) {
    return {
      gameInProgress: false
    };
  }

  const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);
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
    blueScore: currentPoint.currentBlueScore,
    gameInProgress: true
  };
};

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team
) => {
  const currentGame = await getCurrentGameOrThrow();
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
  const currentGame = await getCurrentGameOrThrow();
  const currentPointId = await getCurrentPointIdFromGameOrThrow(currentGame);
  await prisma.playerPoint.deleteMany({
    where: {
      pointId: currentPointId
    }
  });
};

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean
) => {
  const gameLogicService = new GameLogicService();

  const currentGame = await getCurrentGameOrThrow();

  const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);

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

export const getNumberOfGoalsScoredByPlayerInCurrentGame = async (
  playerId: number
) => {
  const playerPointsForPlayer =
    await getAllPlayerPointsForPlayerInCurrentGame(playerId);

  if (playerPointsForPlayer == null) return null;

  const goalScored = playerPointsForPlayer.reduce(
    (totalGoals, playerPoint) => totalGoals + (playerPoint.scoredGoal ? 1 : 0),
    0
  );
  const ownGoalsScored = playerPointsForPlayer.reduce(
    (totalOwnGoalsScored, playerPoint) =>
      totalOwnGoalsScored + (playerPoint.ownGoal ? 1 : 0),
    0
  );
  return {
    goalScored,
    ownGoalsScored
  };
};

export const removePlayerFromCurrentGame = async (playerId: number) => {
  const currentPlayerPointForPlayer =
    await getCurrentPlayerPointForPlayerOrThrow(playerId);
  deletePlayerPoint(currentPlayerPointForPlayer.id);
};

export const abandonCurrentGame = async () => {
  const currentGame = await getCurrentGameOrThrow();

  const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);

  await prisma.game.update({
    where: {
      id: currentGame.id
    },
    data: {
      abandoned: true,
      finalScoreBlue: currentPoint.currentBlueScore,
      finalScoreRed: currentPoint.currentRedScore
    }
  });
};

export const startGame = async () => {
  await new GameLogicService().startGame();
};

export const reorderPlayer = async (playerId: number, newPosition: number) => {
  const playerPoint = await getCurrentPlayerPointForPlayerOrThrow(playerId);
  await new RotationService().reorderPlayerPoint(playerPoint, newPosition);
};

export const getRotatyStrategy = async (team: Team) => {
  const currentGame = await getCurrentGameOrThrow();
  return team === 'Red' ? currentGame.rotatyRed : currentGame.rotatyBlue;
};

export const updateRotatyStrategyAction = async (
  rotatyStrategy: RotatyStrategy,
  team: Team
) => {
  const currentGame = await getCurrentGameOrThrow();
  await updateRotatyStrategy(currentGame, rotatyStrategy, team);
};
