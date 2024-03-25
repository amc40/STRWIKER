'use server';

import { $Enums, RotatyStrategy, Team } from '@prisma/client';
import { GameLogicService } from '../app/services/gameLogicService';
import { PlayerPointPositionService } from '../app/services/playerPointPositionService';
import { PlayerInfo } from '../app/view/PlayerInfo';
import { StatsEngineFwoar } from '../app/services/statsEngine';
import { revalidatePath } from 'next/cache';

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team,
) => {
  await new GameLogicService().addPlayerToCurrentPoint(playerId, team);
  revalidateCurrentGame();
};

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean,
) => {
  await new GameLogicService().scoreGoalInCurrentGame(scorerInfo.id, ownGoal);
  revalidateCurrentGame();
};

export const getNumberOfGoalsScoredByPlayerInCurrentGame = async (
  playerId: number,
) => {
  return await new StatsEngineFwoar().getNumberOfGoalsScoredByPlayerInCurrentGame(
    playerId,
  );
};

export const removePlayerFromCurrentGame = async (playerId: number) => {
  await new GameLogicService().removePlayerFromCurrentPoint(playerId);
  revalidateCurrentGame();
};

export const abandonCurrentGame = async () => {
  await new GameLogicService().abandonCurrentGame();
  revalidateCurrentGame();
};

export const startGame = async () => {
  await new GameLogicService().startGame();
  revalidateCurrentGame();
};

export const reorderPlayer = async (playerId: number, newPosition: number) => {
  await new PlayerPointPositionService().reorderPlayerInCurrentGame(
    playerId,
    newPosition,
  );
  revalidateCurrentGame();
};

export const getRotatyStrategy = async (team: Team) => {
  return new PlayerPointPositionService().getRotatyStrategyInCurrentGame(team);
};

export const updateRotatyStrategyAction = async (
  rotatyStrategy: RotatyStrategy,
  team: Team,
) => {
  await new PlayerPointPositionService().updateRotatyStrategyForTeamInCurrentGame(
    rotatyStrategy,
    team,
  );
  revalidateCurrentGame();
};

const revalidateCurrentGame = () => {
  revalidatePath('/current-game', 'page');
};
