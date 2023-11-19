import { $Enums, PlayerPoint } from '@prisma/client';
import { PlayerPage } from './PlayerPage';
import {
  PlayerPointWithPlayer,
  getCurrentGameInfo
} from '../../lib/Game.actions';

export interface PlayerInfo {
  id: number;
  name: string;
  team: $Enums.Team;
}

export const playerPointWithPlayerToPlayerInfo = (
  playerPoint: PlayerPointWithPlayer
) => ({
  id: playerPoint.playerId,
  name: playerPoint.player.name,
  team: playerPoint.team
});

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
