import { $Enums } from '@prisma/client';
import { PlayerPage, playerPointWithPlayerToPlayerInfo } from './PlayerPage';
import { getCurrentGameInfo } from '../../lib/Game.actions';

export interface PlayerInfo {
  id: number;
  name: string;
  team: $Enums.Team;
}

export default async function Page() {
  const { playerPoints, redScore, blueScore } = await getCurrentGameInfo();
  const playersFormatted = playerPoints.map(playerPointWithPlayerToPlayerInfo);

  return (
    <PlayerPage
      serverRedScore={redScore}
      serverBlueScore={blueScore}
      serverPlayers={playersFormatted}
    />
  );
}
