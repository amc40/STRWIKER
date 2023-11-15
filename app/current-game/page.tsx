'use client';

import { $Enums, Player } from '@prisma/client';
import { Team } from '../components/team';
import { FC, useEffect, useState } from 'react';
 import { experimental_useOptimistic as useOptimistic } from 'react';
import AddPlayerToTeam from '../components/add-player-to-team';
import fetchCurrentGameInfo from '../../lib/fetchCurrentGameInfo';
import { PlayerPointWithPlayer } from '../api/current-game/info/route';

export interface PlayerInfo {
  id: number,
  name: string,
  team: $Enums.Team
};

export default function Page() {
  const [playerPoints, setPlayerPoints] = useState<PlayerPointWithPlayer[]>([]);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { playerPoints, redScore, blueScore } = await fetchCurrentGameInfo();
      setPlayerPoints(playerPoints);
      setRedScore(redScore);
      setBlueScore(blueScore);
      setTimeout(loadData, 1000);
    }
    loadData();
    console.log("the use effect has been caleed2");
  }, []);

  const playersFormatted = playerPoints.map((playerPoint) => ({
    id: playerPoint.playerId,
    name: playerPoint.player.name,
    team: playerPoint.team
  }));

  return (
    <PlayerPage redScore={redScore} blueScore={blueScore} players={playersFormatted} />
  );
}

const PlayerPage: FC<{ redScore: number, blueScore: number, players: PlayerInfo[] }> = ({ redScore, blueScore, players }) => {
  const [optimisticPlayers, addOptimisticPlayer] = useOptimistic(
    players,
    (state: PlayerInfo[], newPlayer: PlayerInfo) => [
      ...state,
      newPlayer
    ]);

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
}
