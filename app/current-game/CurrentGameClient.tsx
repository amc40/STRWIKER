'use client';
import { $Enums } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { experimental_useOptimistic as useOptimistic } from 'react';
import { Team } from '../components/team';
import AddPlayerToTeam from '../components/add-player-to-team';
import { ClearCurrentGamePlayers } from '../components/clear-current-game-players';
import {
  PlayerInfo,
  addPlayerToCurrentGame,
  clearCurrentGamePlayers,
  getCurrentGameInfo,
  removePlayerFromCurrentGame
} from '../../lib/Game.actions';
import SettingsButton from '../components/SettingsButton';
import { SettingsModal } from '../components/SettingsModal';
import { NoGameInProgress } from './NoGameInProgress';

const MS_BETWEEN_REFRESHES = 1000;

enum OptimisticAction {
  ADD,
  CLEAR,
  REMOVE
}

type SetOptimisticPlayerArgs =
  | { action: OptimisticAction.ADD; player: PlayerInfo }
  | { action: OptimisticAction.CLEAR; player: undefined }
  | { action: OptimisticAction.REMOVE; player: PlayerInfo };

export const CurrentGameClient: FC<{
  serverRedScore: number;
  serverBlueScore: number;
  serverPlayers: PlayerInfo[];
}> = ({ serverRedScore, serverBlueScore, serverPlayers }) => {
  const [gameInProgress, setGameInProgress] = useState(true);
  const [players, setPlayers] = useState(serverPlayers);
  const [redScore, setRedScore] = useState(serverRedScore);
  const [blueScore, setBlueScore] = useState(serverBlueScore);

  // on initial render setup a function to refresh the current game info every MS_BETWEEN_REFRESHES
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const currentGameInfo = await getCurrentGameInfo();
      if (currentGameInfo.gameInProgress) {
        setPlayers(currentGameInfo.players);
        setRedScore(currentGameInfo.redScore);
        setBlueScore(currentGameInfo.blueScore);
      } else {
        setGameInProgress(false);
      }
    }, MS_BETWEEN_REFRESHES);
    return () => clearInterval(refreshInterval);
  }, []);

  const [optimisticPlayers, setOptimisticPlayers] = useOptimistic(
    players,
    (state: PlayerInfo[], { action, player }: SetOptimisticPlayerArgs) => {
      switch (action) {
        case OptimisticAction.ADD:
          return [...state, player];
        case OptimisticAction.CLEAR:
          return [];
        case OptimisticAction.REMOVE:
          return state.filter((playerInfo) => playerInfo.id !== player.id);
        default:
          return [];
      }
    }
  );

  const addPlayer = async (
    playerId: number,
    playerName: string,
    team: $Enums.Team
  ) => {
    setOptimisticPlayers({
      action: OptimisticAction.ADD,
      player: {
        id: playerId,
        name: playerName,
        team,
        // should be added at the end
        position: Number.MAX_SAFE_INTEGER
      }
    });
    await addPlayerToCurrentGame(playerId, team);
  };

  const clearPlayers = async () => {
    setOptimisticPlayers({ action: OptimisticAction.CLEAR, player: undefined });
    await clearCurrentGamePlayers();
  };

  const removePlayer = async (player: PlayerInfo) => {
    setOptimisticPlayers({
      action: OptimisticAction.REMOVE,
      player
    });
    await removePlayerFromCurrentGame(player.id);
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return gameInProgress ? (
    <main>
      <span className="z-10 fixed right-10 md:right-20 bottom-10 inline-block">
        <SettingsButton onClick={() => setShowSettingsModal(true)} />
      </span>
      <SettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      <div style={{ display: 'flex', height: '100vh' }}>
        <Team
          team={$Enums.Team.Blue}
          members={optimisticPlayers
            .filter((player) => player.team === 'Blue')
            .sort((a, b) => a.position - b.position)}
          score={blueScore}
          removePlayer={removePlayer}
        >
          <AddPlayerToTeam
            team={$Enums.Team.Blue}
            addPlayer={addPlayer}
            existingPlayers={players}
          />
        </Team>
        <Team
          team={$Enums.Team.Red}
          members={optimisticPlayers
            .filter((player) => player.team === 'Red')
            .sort((a, b) => a.position - b.position)}
          score={redScore}
          removePlayer={removePlayer}
        >
          <AddPlayerToTeam
            team={$Enums.Team.Red}
            addPlayer={addPlayer}
            existingPlayers={players}
          />
        </Team>
      </div>
    </main>
  ) : (
    <NoGameInProgress />
  );
};
