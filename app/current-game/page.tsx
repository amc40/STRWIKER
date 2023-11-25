import { PlayerPage } from './PlayerPage';
import { getCurrentGameInfo } from '../../lib/Game.actions';

export default async function Page() {
  const { players, redScore, blueScore } = await getCurrentGameInfo();

  return (
    <PlayerPage
      serverRedScore={redScore}
      serverBlueScore={blueScore}
      serverPlayers={players}
    />
  );
}
