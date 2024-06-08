import { redirect } from 'next/navigation';
import { NoGameInProgress } from './NoGameInProgress';
import { RedirectToCurrentGameWhenGameStarts } from './RedirectToCurrentGameWhenGameStarts';
import { GameInfoService } from '../services/gameInfoService';

const gameInfoService = new GameInfoService();

export default async function Page() {
  const gameInProgress = await gameInfoService.isGameInProgress();

  if (gameInProgress) {
    redirect('/current-game');
  }

  return (
    <>
      <NoGameInProgress />
      <RedirectToCurrentGameWhenGameStarts />
    </>
  );
}
