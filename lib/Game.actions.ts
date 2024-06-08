'use server';

import { $Enums, RotatyStrategy, Team } from '@prisma/client';
import { GameLogicService, IsGameEnd } from '../app/services/gameLogicService';
import { PlayerPointPositionService } from '../app/services/playerPointPositionService';
import { PlayerInfo } from '../app/view/PlayerInfo';
import { revalidatePath } from 'next/cache';
import { supabaseClient } from '../app/utils/supabase';
import { GameInfoService } from '../app/services/gameInfoService';

const gameInfoService = new GameInfoService();

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team,
) => {
  await new GameLogicService().addPlayerToCurrentPoint(playerId, team);
  await registerUpdatedGameState();
};

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean,
) => {
  const isGameEnd = await new GameLogicService().scoreGoalInCurrentGame(
    scorerInfo.id,
    ownGoal,
  );
  if (isGameEnd == IsGameEnd.GAME_ENDS) {
    await registerGameEnd();
  } else {
    await registerUpdatedGameState();
  }
};

export const removePlayerFromCurrentGame = async (playerId: number) => {
  await new GameLogicService().removePlayerFromCurrentPoint(playerId);
  await registerUpdatedGameState();
};

export const abandonCurrentGame = async () => {
  await new GameLogicService().abandonCurrentGame();
  await registerGameEnd();
};

export const startGame = async () => {
  await new GameLogicService().startGame();
  await registerGameStart();
};

export const reorderPlayer = async (playerId: number, newPosition: number) => {
  await new PlayerPointPositionService().reorderPlayerInCurrentGame(
    playerId,
    newPosition,
  );
  await registerUpdatedGameState();
};

export const updateRotatyStrategyAction = async (
  rotatyStrategy: RotatyStrategy,
  team: Team,
) => {
  await new PlayerPointPositionService().updateRotatyStrategyForTeamInCurrentGame(
    rotatyStrategy,
    team,
  );
  await registerUpdatedGameState();
};

const registerUpdatedGameState = async () => {
  revalidatePath('/current-game', 'page');
  const channel = supabaseClient.channel('current-game-state');
  const currentGame = await gameInfoService.getCurrentGameInfo();
  await channel.send({
    type: 'broadcast',
    event: 'game-state',
    payload: currentGame,
  });

  await supabaseClient.removeChannel(channel);
};

const registerGameStart = async () => {
  revalidatePath('/current-game', 'page');
  revalidatePath('/no-game-in-progress', 'page');
  const channel = supabaseClient.channel('current-game-start');
  await channel.send({
    type: 'broadcast',
    event: 'game-start',
    payload: {},
  });

  await supabaseClient.removeChannel(channel);
};

const registerGameEnd = async () => {
  revalidatePath('/current-game', 'page');
  revalidatePath('/no-game-in-progress', 'page');
  const channel = supabaseClient.channel('current-game-end');
  await channel.send({
    type: 'broadcast',
    event: 'game-end',
    payload: {},
  });

  await supabaseClient.removeChannel(channel);
};
