'use server';

import {
  $Enums,
  Player,
  PlayerPoint,
  RotatyStrategy,
  Team
} from '@prisma/client';
import { GameLogicService } from '../app/services/gameLogicService';
import { getCurrentPointFromGameOrThrow } from '../app/repository/pointRepository';
import {
  deletePlayerPoint,
  getAllPlayerPointsAndPlayersByPoint,
  getAllPlayerPointsForPlayerInCurrentGame,
  getCurrentPlayerPointForPlayerOrThrow
} from '../app/repository/playerPointRepository';
import {
  getCurrentGame,
  getCurrentGameOrThrow,
  updateRotatyStrategy
} from '../app/repository/gameRepository';
import { PlayerPointPositionService } from '../app/services/playerPointPositionService';

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
  const currentPointPlayers =
    await getAllPlayerPointsAndPlayersByPoint(currentPoint);

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
  new GameLogicService().addPlayerToCurrentGame(playerId, team);
};

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean
) => {
  return new GameLogicService().scoreGoalInCurrentGame(scorerInfo.id, ownGoal);
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
  await new GameLogicService().abandonCurrentGame();
};

export const startGame = async () => {
  await new GameLogicService().startGame();
};

export const reorderPlayer = async (playerId: number, newPosition: number) => {
  const playerPoint = await getCurrentPlayerPointForPlayerOrThrow(playerId);
  await new PlayerPointPositionService().reorderPlayerPoint(
    playerPoint,
    newPosition
  );
};

export const getRotatyStrategy = async (team: Team) => {
  const currentGame = await getCurrentGameOrThrow();
  return team === 'Red' ? currentGame.rotatyRed : currentGame.rotatyBlue;
};

export const updateRotatyStrategyAction = async (
  rotatyStrategy: RotatyStrategy,
  team: Team
) => {
  return await new PlayerPointPositionService().updateRotatyStrategyForTeamInCurrentGame(
    rotatyStrategy,
    team
  );
};
