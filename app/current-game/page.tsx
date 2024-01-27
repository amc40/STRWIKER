import { CurrentGameClient } from './CurrentGameClient';
import { getCurrentGameInfo } from '../../lib/Game.actions';
import { NoGameInProgress } from './NoGameInProgress';

export default async function Page() {
  const currentGameInfo = await getCurrentGameInfo();

  return currentGameInfo.gameInProgress ? (
    <CurrentGameClient
      serverRedScore={currentGameInfo.redScore}
      serverBlueScore={currentGameInfo.blueScore}
      serverPlayers={currentGameInfo.players}
    />
  ) : (
    <NoGameInProgress />
  );
}
