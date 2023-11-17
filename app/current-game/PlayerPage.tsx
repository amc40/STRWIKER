'use client'
import { $Enums } from '@prisma/client';
import { FC } from 'react';
import { PlayerInfo } from './page';
import { experimental_useOptimistic as useOptimistic } from 'react';
import { Team } from '../components/team';
import AddPlayerToTeam from '../components/add-player-to-team';

export const PlayerPage: FC<{
  redScore: number;
  blueScore: number;
  players: PlayerInfo[];
}> = ({ redScore, blueScore, players }) => {
  const [optimisticPlayers, addOptimisticPlayer] = useOptimistic(
    players,
    (state: PlayerInfo[], newPlayer: PlayerInfo) => [...state, newPlayer]
  );

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div style={{ display: 'flex', height: '100vh' }}>
        <Team
          team={$Enums.Team.Blue}
          members={optimisticPlayers.filter((player) => player.team === 'Blue')}
          score={blueScore}
        >
          <AddPlayerToTeam
            team={$Enums.Team.Blue}
            addOptimisticPlayer={addOptimisticPlayer}
            existingPlayers={players}
          />
        </Team>
        <Team
          team={$Enums.Team.Red}
          members={optimisticPlayers.filter((player) => player.team === 'Red')}
          score={redScore}
        >
          <AddPlayerToTeam
            team={$Enums.Team.Red}
            addOptimisticPlayer={addOptimisticPlayer}
            existingPlayers={players}
          />
        </Team>
      </div>
    </main>
  );
};
