import { CurrentGameClient } from './CurrentGameClient';
import { NoGameInProgress } from './NoGameInProgress';
import { fetchCurrentGameInfo } from '../network/fetchCurrentGameInfo';

const MS_BETWEEN_REFRESHES = 1000;

export default async function Page() {
  const currentGameInfo = await fetchCurrentGameInfo(MS_BETWEEN_REFRESHES);

  console.log(currentGameInfo);

  return currentGameInfo != null ? (
    <CurrentGameClient
      serverRedScore={currentGameInfo.redScore}
      serverBlueScore={currentGameInfo.blueScore}
      serverPlayers={currentGameInfo.players}
    />
  ) : (
    <NoGameInProgress />
  );
}
