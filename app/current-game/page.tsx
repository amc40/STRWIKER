import { $Enums } from '@prisma/client';
import { PlayerPage } from './PlayerPage';
import { getCurrentGameInfo } from '../../lib/Game.actions';

export interface PlayerInfo {
  id: number,
  name: string,
  team: $Enums.Team
};

export default async function Page() {
  const { playerPoints, redScore, blueScore } = await getCurrentGameInfo();
  const playersFormatted = playerPoints.map((playerPoint) => ({
    id: playerPoint.playerId,
    name: playerPoint.player.name,
    team: playerPoint.team
  }));

  return (
    <PlayerPage redScore={redScore} blueScore={blueScore} players={playersFormatted} />
  );
}
