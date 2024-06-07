import { redirect } from 'next/navigation';
import { NoGameInProgress } from './NoGameInProgress';
import { RedirectToCurrentGameWhenGameStarts } from './RedirectToCurrentGameWhenGameStarts';
import { GameInfoService } from '../services/gameInfoService';

const gameInfoService = new GameInfoService();

export default async function Page() {
  const currentGameInfo = await gameInfoService.getCurrentGameInfo();

  console.log('currentGameInfo', currentGameInfo);

  if (currentGameInfo != null) {
    redirect('/current-game');
  }

  return (
    <>
      <NoGameInProgress />
      <RedirectToCurrentGameWhenGameStarts />
    </>
  );
}
