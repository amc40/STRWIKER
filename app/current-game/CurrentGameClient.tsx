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
  getCurrentGameInfo
} from '../../lib/Game.actions';

const MS_BETWEEN_REFRESHES = 1000;

enum OptimisticAction {
  ADD,
  CLEAR
}

type SetOptimisticPlayerArgs =
  | { action: OptimisticAction.ADD; player: PlayerInfo }
  | { action: OptimisticAction.CLEAR; player: undefined };

export const CurrentGameClient: FC<{
  serverRedScore: number;
  serverBlueScore: number;
  serverPlayers: PlayerInfo[];
}> = ({ serverRedScore, serverBlueScore, serverPlayers }) => {
  const [players, setPlayers] = useState(serverPlayers);
  const [redScore, setRedScore] = useState(serverRedScore);
  const [blueScore, setBlueScore] = useState(serverBlueScore);

  // on initial render setup a function to refresh the current game info every MS_BETWEEN_REFRESHES
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const { players, redScore, blueScore } = await getCurrentGameInfo();

      setPlayers(players);
      setRedScore(redScore);
      setBlueScore(blueScore);
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

  return (
    <>
      <ClearCurrentGamePlayers clearPlayers={clearPlayers} />
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div style={{ display: 'flex', height: '100vh' }}>
          <Team
            team={$Enums.Team.Blue}
            members={optimisticPlayers
              .filter((player) => player.team === 'Blue')
              .sort((a, b) => a.position - b.position)}
            score={blueScore}
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
          >
            <AddPlayerToTeam
              team={$Enums.Team.Red}
              addPlayer={addPlayer}
              existingPlayers={players}
            />
          </Team>
        </div>
      </main>
    </>
  );
};
