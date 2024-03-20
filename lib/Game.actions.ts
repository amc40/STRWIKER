'use server';

import { $Enums, RotatyStrategy, Team } from '@prisma/client';
import { GameLogicService } from '../app/services/gameLogicService';
import { getAllPlayerPointsForPlayerInCurrentGame } from '../app/repository/playerPointRepository';
import { PlayerPointPositionService } from '../app/services/playerPointPositionService';
import { PlayerInfo } from '../app/view/PlayerInfo';
import { GameInfo } from '../app/view/CurrentGameInfo';
import { GameInfoService } from '../app/services/gameInfoService';
import { StatsEngineFwoar } from '../app/services/statsEngine';

export const getCurrentGameInfo = async (): Promise<GameInfo> => {
  return await new GameInfoService().getCurrentGameInfo();
};

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team
) => {
  new GameLogicService().addPlayerToCurrentPoint(playerId, team);
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
  return new StatsEngineFwoar().getNumberOfGoalsScoredByPlayerInCurrentGame(
    playerId
  );
};

export const removePlayerFromCurrentGame = async (playerId: number) => {
  return new GameLogicService().removePlayerFromCurrentPoint(playerId);
};

export const abandonCurrentGame = async () => {
  await new GameLogicService().abandonCurrentGame();
};

export const startGame = async () => {
  await new GameLogicService().startGame();
};

export const reorderPlayer = async (playerId: number, newPosition: number) => {
  await new PlayerPointPositionService().reorderPlayerInCurrentGame(
    playerId,
    newPosition
  );
};

export const getRotatyStrategy = async (team: Team) => {
  return new PlayerPointPositionService().getRotatyStrategyInCurrentGame(team);
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
