import React from 'react';
import { StartFreshGameButton } from '../components/start-game/StartFreshGameButton';
import { StartGameWithPreviousPlayersButton } from '../components/start-game/StartGameWithPreviousPlayersButton';
import { getMostRecentFinishedGame } from '../repository/gameRepository';

export const NoGameInProgress: React.FC = async () => {
  const mostRecentFinishedGame = await getMostRecentFinishedGame();

  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-7xl">
        No Game in Progress
      </h1>
      <StartFreshGameButton />
      {mostRecentFinishedGame != null ? (
        <StartGameWithPreviousPlayersButton />
      ) : null}
    </main>
  );
};
