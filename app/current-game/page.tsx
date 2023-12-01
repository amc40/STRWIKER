import { CurrentGameClient } from './CurrentGameClient';
import { getCurrentGameInfo } from '../../lib/Game.actions';

export default async function Page() {
  const { players, redScore, blueScore } = await getCurrentGameInfo();

  return (
    <CurrentGameClient
      serverRedScore={redScore}
      serverBlueScore={blueScore}
      serverPlayers={players}
    />
  );
}
