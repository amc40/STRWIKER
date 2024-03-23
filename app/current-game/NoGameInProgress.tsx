import React from 'react';
import { StartGameButton } from '../components/StartGameButton';
import { RefreshWhenGameStarts } from '../components/RefreshWhenGameStarts';

export const NoGameInProgress: React.FC = () => {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          No Game in Progress
        </h1>
        <StartGameButton />
      </div>
      {/* This must be its own component as it must be a client component */}
      <RefreshWhenGameStarts />
    </main>
  );
};
