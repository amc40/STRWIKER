import { useCallback, useEffect, useRef } from 'react';
import { supabaseClient } from '../utils/supabase';
import { GameStateBroadcastPayload } from '@/lib/Game.actions';
import { GameState } from '../view/GameState';
import { v4 as uuidv4 } from 'uuid';

export const useGameStateListener = (
  setGameState: (gameState: GameState) => void,
) => {
  const latestOutstandingLocalGameStateMutationIdRef = useRef<string | null>(
    null,
  );

  const registerGameStateMutation = useCallback(() => {
    const mutationId = uuidv4();
    latestOutstandingLocalGameStateMutationIdRef.current = mutationId;
    return mutationId;
  }, []);

  const onGameStateMutationError = useCallback(() => {
    latestOutstandingLocalGameStateMutationIdRef.current = null;
  }, []);

  const updateGameStateIfNotAwaitingOwnMutation = useCallback(
    (gameStateBroadcastPayload: GameStateBroadcastPayload) => {
      const { currentGame, gameStateMutationId } = gameStateBroadcastPayload;
      console.log('game state broadcast', gameStateMutationId);

      // Only update state if we're not awaiting our own mutation or if this is the response to our latest mutation
      // prevents the state appearing to apply based on local optimistic updates and then be removed by an earlier update
      if (
        currentGame != null &&
        (latestOutstandingLocalGameStateMutationIdRef.current === null ||
          latestOutstandingLocalGameStateMutationIdRef.current ===
            gameStateMutationId)
      ) {
        const gameState: GameState = {
          players: currentGame.players,
          redScore: currentGame.teamInfo.Red.score,
          blueScore: currentGame.teamInfo.Blue.score,
          redRotatyStrategy: currentGame.teamInfo.Red.rotatyStrategy,
          blueRotatyStrategy: currentGame.teamInfo.Blue.rotatyStrategy,
          pointStarted: currentGame.pointStarted,
        };
        setGameState(gameState);
        console.log('setting game state');
      }

      // If this is a response to our own mutation, clear the mutation ID reference
      if (
        gameStateMutationId ===
        latestOutstandingLocalGameStateMutationIdRef.current
      ) {
        console.log('Received response for our mutation', gameStateMutationId);
        latestOutstandingLocalGameStateMutationIdRef.current = null;
      }
    },
    [setGameState],
  );

  useEffect(() => {
    const gameStateListener = supabaseClient
      .channel('current-game-state')
      .on('broadcast', { event: 'game-state' }, ({ payload }) => {
        const gameStateBroadcastPayload = payload as GameStateBroadcastPayload;
        updateGameStateIfNotAwaitingOwnMutation(gameStateBroadcastPayload);
      })
      .subscribe();

    return () => {
      void gameStateListener.unsubscribe();
    };
  }, [updateGameStateIfNotAwaitingOwnMutation]);

  return {
    registerGameStateMutation,
    onGameStateMutationError,
  };
};
