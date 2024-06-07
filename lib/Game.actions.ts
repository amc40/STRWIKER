'use server';

import { $Enums, RotatyStrategy, Team } from '@prisma/client';
import { GameLogicService } from '../app/services/gameLogicService';
import { PlayerPointPositionService } from '../app/services/playerPointPositionService';
import { PlayerInfo } from '../app/view/PlayerInfo';
import { StatsEngineFwoar } from '../app/services/statsEngine';
import { revalidatePath } from 'next/cache';
import { supabaseClient } from '../app/utils/supabase';

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team,
) => {
  await new GameLogicService().addPlayerToCurrentPoint(playerId, team);
  await revalidateCurrentGame();
};

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean,
) => {
  await new GameLogicService().scoreGoalInCurrentGame(scorerInfo.id, ownGoal);
  await revalidateCurrentGame();
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
  await revalidateCurrentGame();
};

export const abandonCurrentGame = async () => {
  await new GameLogicService().abandonCurrentGame();
  await revalidateCurrentGame();
};

export const startGame = async () => {
  await new GameLogicService().startGame();
  await revalidateCurrentGame();
};

export const reorderPlayer = async (playerId: number, newPosition: number) => {
  await new PlayerPointPositionService().reorderPlayerInCurrentGame(
    playerId,
    newPosition,
  );
  await revalidateCurrentGame();
};

export const updateRotatyStrategyAction = async (
  rotatyStrategy: RotatyStrategy,
  team: Team,
) => {
  await new PlayerPointPositionService().updateRotatyStrategyForTeamInCurrentGame(
    rotatyStrategy,
    team,
  );
  await revalidateCurrentGame();
};

const revalidateCurrentGame = async () => {
  revalidatePath('/current-game', 'page');
  const channel = supabaseClient.channel('test');
  await channel.send({
    type: 'broadcast',
    event: 'test',
    payload: {
      testText: 'hello world!',
    },
  });

  await supabaseClient.removeChannel(channel);
};
