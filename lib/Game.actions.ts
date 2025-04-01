'use server';

import { $Enums, RotatyStrategy, Team } from '@prisma/client';
import { GameLogicService, IsGameEnd } from '../app/services/gameLogicService';
import { PlayerPointPositionService } from '../app/services/playerPointPositionService';
import { PlayerInfo } from '../app/view/PlayerInfo';
import { supabaseClient } from '../app/utils/supabase';
import { GameInfoService } from '../app/services/gameInfoService';
import { revalidatePath } from 'next/cache';
import { GameInfo } from '@/app/view/GameInfo';

const gameInfoService = new GameInfoService();

export const startFreshGame = async () => {
  await new GameLogicService().startFreshGame();
  await registerGameStart();
};

export const startGameWithPreviousPlayers = async () => {
  await new GameLogicService().startGameFromPreviousGame();
  await registerGameStart();
};

export const abandonCurrentGame = async () => {
  await new GameLogicService().abandonCurrentGame();
  await registerGameEnd();
};

export const addPlayerToCurrentGame = async (
  playerId: number,
  team: $Enums.Team,
  gameStateMutationId: string,
) => {
  await new GameLogicService().addPlayerToCurrentPoint(playerId, team);
  await registerUpdatedGameState(gameStateMutationId);
};

export const startCurrentPoint = async (gameStateMutationId: string) => {
  await new GameLogicService().startCurrentPoint();
  await registerUpdatedGameState(gameStateMutationId);
};

export const recordGoalScored = async (
  scorerInfo: PlayerInfo,
  ownGoal: boolean,
  gameStateMutationId: string,
) => {
  const isGameEnd = await new GameLogicService().scoreGoalInCurrentGame(
    scorerInfo.id,
    ownGoal,
  );
  if (isGameEnd == IsGameEnd.GAME_ENDS) {
    await registerGameEnd();
  } else {
    await registerUpdatedGameState(gameStateMutationId);
  }
};

export const removePlayerFromCurrentGame = async (
  playerId: number,
  gameStateMutationId: string,
) => {
  await new GameLogicService().removePlayerFromCurrentPoint(playerId);
  await registerUpdatedGameState(gameStateMutationId);
};

export const reorderPlayer = async (
  playerId: number,
  newPosition: number,
  gameStateMutationId: string,
) => {
  await new PlayerPointPositionService().reorderPlayerInCurrentGame(
    playerId,
    newPosition,
  );
  await registerUpdatedGameState(gameStateMutationId);
};

export const updateRotatyStrategyAction = async (
  rotatyStrategy: RotatyStrategy,
  team: Team,
  gameStateMutationId: string,
) => {
  await new PlayerPointPositionService().updateRotatyStrategyForTeamInCurrentGame(
    rotatyStrategy,
    team,
  );
  await registerUpdatedGameState(gameStateMutationId);
};

export const updatePlayerSkippedStatus = async (
  playerId: number,
  skipped: boolean,
  gameStateMutationId: string,
) => {
  await new GameLogicService().updatePlayerSkippedStatus(playerId, skipped);
  await registerUpdatedGameState(gameStateMutationId);
};

export interface GameStateBroadcastPayload {
  currentGame: GameInfo | null;
  gameStateMutationId: string | null;
}

const registerUpdatedGameState = async (gameStateMutationId: string) => {
  const channel = supabaseClient.channel('current-game-state');
  const currentGame = await gameInfoService.getCurrentGameInfo();
  const payload: GameStateBroadcastPayload = {
    currentGame,
    gameStateMutationId,
  };
  await channel.send({
    type: 'broadcast',
    event: 'game-state',
    payload,
  });

  await supabaseClient.removeChannel(channel);
};

const registerGameStart = async () => {
  const channel = supabaseClient.channel('current-game-start');
  await channel.send({
    type: 'broadcast',
    event: 'game-start',
    payload: {},
  });

  await supabaseClient.removeChannel(channel);
};

const registerGameEnd = async () => {
  const channel = supabaseClient.channel('current-game-end');
  await channel.send({
    type: 'broadcast',
    event: 'game-end',
    payload: {},
  });

  await supabaseClient.removeChannel(channel);
  revalidatePath('/player-ranking');
};
