import { RotatyStrategy, Team } from '@prisma/client';
import { useCallback, useEffect, useOptimistic, useState } from 'react';
import { PlayerInfo } from '../view/PlayerInfo';
import { GameState } from '../view/GameState';
import { useGameStateListener } from './useGameStateListener';
import { useMessage } from '../context/MessageContext';
import {
  addPlayerToCurrentGame,
  removePlayerFromCurrentGame,
  reorderPlayer as reorderPlayerAction,
  updateRotatyStrategyAction,
  recordGoalScored as recordGoalScoredAction,
} from '@/lib/Game.actions';
import { GameInfo } from '../view/GameInfo';

export interface GameStateWithMutations extends GameState {
  addPlayer: (playerId: number, playerName: string, team: Team) => void;
  removePlayer: (player: PlayerInfo) => void;
  reorderPlayer: (player: PlayerInfo, destinationIndex: number) => void;
  updateRotatyStrategy: (team: Team, rotatyStrategy: RotatyStrategy) => void;
  playerIdRecordingGoal: number | null;
  playerIdRecordingOwnGoal: number | null;
  recordGoalScored: (player: PlayerInfo, ownGoal: boolean) => void;
}

type OptimisticPlayerMutationAction =
  | {
      type: 'addPlayer';
      playerId: number;
      playerName: string;
      team: Team;
    }
  | {
      type: 'removePlayer';
      playerId: number;
    }
  | {
      type: 'reorderPlayer';
      playerToReorder: PlayerInfo;
      destinationIndex: number;
    };

interface OptimisticRotatyStrategyMutationAction {
  type: 'updateRotatyStrategy';
  rotatyStrategy: RotatyStrategy;
}

const updatePlayerOrderAfterReorder = (
  player: PlayerInfo,
  playerReordered: PlayerInfo,
  destinationIndex: number,
): PlayerInfo => {
  if (player.team !== playerReordered.team) {
    return player;
  }

  if (player.id === playerReordered.id) {
    return {
      ...player,
      position: destinationIndex,
    };
  }

  if (player.position === playerReordered.position) {
    throw new Error(
      `Not playerReordered, but positions before reordered match. player: ${JSON.stringify(
        player,
      )}, playerReordered: ${JSON.stringify(
        playerReordered,
      )}, destinationIndex: ${destinationIndex.toFixed()}`,
    );
  }

  if (player.position < playerReordered.position) {
    if (player.position < destinationIndex) {
      return player;
    }
    return {
      ...player,
      position: player.position + 1,
    };
  }

  if (player.position > destinationIndex) {
    return player;
  }

  return {
    ...player,
    position: player.position - 1,
  };
};

const optimisticPlayersReducer = (
  currentPlayers: PlayerInfo[],
  update: OptimisticPlayerMutationAction,
) => {
  switch (update.type) {
    case 'addPlayer':
      return [
        ...currentPlayers,
        {
          id: update.playerId,
          name: update.playerName,
          team: update.team,
          position: currentPlayers.length + 1,
          goalsScored: 0,
          ownGoalsScored: 0,
        },
      ];
    case 'removePlayer':
      return currentPlayers.filter((player) => player.id !== update.playerId);
    case 'reorderPlayer':
      return currentPlayers.map((player) =>
        updatePlayerOrderAfterReorder(
          player,
          update.playerToReorder,
          update.destinationIndex,
        ),
      );
  }
};

const optimisticRotatyStrategyReducer = (
  currentRotatyStrategy: RotatyStrategy,
  update: OptimisticRotatyStrategyMutationAction,
) => {
  return update.rotatyStrategy;
};

export const useGameState = (
  initialGameInfo: GameInfo,
): GameStateWithMutations => {
  const [players, setPlayers] = useState(initialGameInfo.players);
  const [redScore, setRedScore] = useState(initialGameInfo.teamInfo.Red.score);
  const [blueScore, setBlueScore] = useState(
    initialGameInfo.teamInfo.Blue.score,
  );
  const [redRotatyStrategy, setRedRotatyStrategy] = useState(
    initialGameInfo.teamInfo.Red.rotatyStrategy,
  );
  const [blueRotatyStrategy, setBlueRotatyStrategy] = useState(
    initialGameInfo.teamInfo.Blue.rotatyStrategy,
  );
  const [pointStarted, setPointStarted] = useState(
    initialGameInfo.pointStarted,
  );

  const setGameState = useCallback(
    (gameState: GameState) => {
      setPlayers(gameState.players);
      setRedScore(gameState.redScore);
      setBlueScore(gameState.blueScore);
      setRedRotatyStrategy(gameState.redRotatyStrategy);
      setBlueRotatyStrategy(gameState.blueRotatyStrategy);
      setPointStarted(gameState.pointStarted);
    },
    [
      setPlayers,
      setRedScore,
      setBlueScore,
      setRedRotatyStrategy,
      setBlueRotatyStrategy,
      setPointStarted,
    ],
  );

  const { registerGameStateMutation, onGameStateMutationError } =
    useGameStateListener(setGameState);

  const [optimisticPlayers, updateOptimisticPlayers] = useOptimistic(
    players,
    optimisticPlayersReducer,
  );
  useEffect(() => {
    console.log('players changed');
  }, [players]);
  console.log('optimisticPlayers', optimisticPlayers);

  const [optimisticRedRotatyStrategy, updateOptimisticRedRotatyStrategy] =
    useOptimistic(redRotatyStrategy, optimisticRotatyStrategyReducer);
  const [optimisticBlueRotatyStrategy, updateOptimisticBlueRotatyStrategy] =
    useOptimistic(blueRotatyStrategy, optimisticRotatyStrategyReducer);

  const { addErrorMessage } = useMessage();

  const addPlayer = useCallback(
    (playerId: number, playerName: string, team: Team) => {
      const mutationId = registerGameStateMutation();
      updateOptimisticPlayers({
        type: 'addPlayer',
        playerId,
        playerName,
        team,
      });
      console.log('adding player');
      const action = async () => {
        await addPlayerToCurrentGame(playerId, team, mutationId);
      };
      action().catch((e: unknown) => {
        onGameStateMutationError();
        addErrorMessage(`Error adding player id ${playerId.toFixed()}`, e);
      });
    },
    [
      updateOptimisticPlayers,
      registerGameStateMutation,
      onGameStateMutationError,
      addErrorMessage,
    ],
  );

  const removePlayer = useCallback(
    (player: PlayerInfo) => {
      const mutationId = registerGameStateMutation();
      updateOptimisticPlayers({
        type: 'removePlayer',
        playerId: player.id,
      });
      const action = async () => {
        await removePlayerFromCurrentGame(player.id, mutationId);
      };
      action().catch((e: unknown) => {
        onGameStateMutationError();
        addErrorMessage(`Error removing player id ${player.id.toFixed()}`, e);
      });
    },
    [
      updateOptimisticPlayers,
      registerGameStateMutation,
      onGameStateMutationError,
      addErrorMessage,
    ],
  );

  const reorderPlayer = useCallback(
    (player: PlayerInfo, destinationIndex: number) => {
      const mutationId = registerGameStateMutation();
      updateOptimisticPlayers({
        type: 'reorderPlayer',
        playerToReorder: player,
        destinationIndex,
      });
      const action = async () => {
        await reorderPlayerAction(player.id, destinationIndex, mutationId);
      };
      action().catch((e: unknown) => {
        onGameStateMutationError();
        addErrorMessage(
          `Error reordering player id ${player.id.toFixed()} to position ${destinationIndex.toFixed()}`,
          e,
        );
      });
    },
    [
      updateOptimisticPlayers,
      registerGameStateMutation,
      onGameStateMutationError,
      addErrorMessage,
    ],
  );

  const updateRotatyStrategy = useCallback(
    (team: Team, rotatyStrategy: RotatyStrategy) => {
      const mutationId = registerGameStateMutation();
      const updateAction: OptimisticRotatyStrategyMutationAction = {
        type: 'updateRotatyStrategy',
        rotatyStrategy,
      };
      if (team === Team.Red) {
        updateOptimisticRedRotatyStrategy(updateAction);
      } else {
        updateOptimisticBlueRotatyStrategy(updateAction);
      }

      const action = async () => {
        await updateRotatyStrategyAction(rotatyStrategy, team, mutationId);
      };
      action().catch((e: unknown) => {
        onGameStateMutationError();
        addErrorMessage(`Error updating rotaty strategy for team ${team}`, e);
      });
    },
    [
      updateOptimisticRedRotatyStrategy,
      updateOptimisticBlueRotatyStrategy,
      registerGameStateMutation,
      onGameStateMutationError,
      addErrorMessage,
    ],
  );

  // TODO: update goals optimistically too!
  const [playerIdRecordingGoal, setPlayerIdRecordingGoal] = useState<
    number | null
  >(null);

  const [playerIdRecordingOwnGoal, setPlayerIdRecordingOwnGoal] = useState<
    number | null
  >(null);

  const recordGoalScored = useCallback(
    (player: PlayerInfo, ownGoal: boolean) => {
      const mutationId = registerGameStateMutation();
      const action = async () => {
        await recordGoalScoredAction(player, ownGoal, mutationId);
      };
      if (ownGoal) {
        setPlayerIdRecordingOwnGoal(player.id);
      } else {
        setPlayerIdRecordingGoal(player.id);
      }

      action()
        .catch((e: unknown) => {
          onGameStateMutationError();
          addErrorMessage(
            `Error recording goal. Own goal ${ownGoal.toString()}`,
            e,
          );
        })
        .finally(() => {
          setPlayerIdRecordingOwnGoal(null);
          setPlayerIdRecordingGoal(null);
        });
    },
    [addErrorMessage, onGameStateMutationError, registerGameStateMutation],
  );

  return {
    players: optimisticPlayers,
    redScore,
    blueScore,
    redRotatyStrategy: optimisticRedRotatyStrategy,
    blueRotatyStrategy: optimisticBlueRotatyStrategy,
    pointStarted,
    addPlayer,
    removePlayer,
    reorderPlayer,
    updateRotatyStrategy,
    playerIdRecordingGoal,
    playerIdRecordingOwnGoal,
    recordGoalScored,
  };
};
