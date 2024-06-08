import React from 'react';
import { StartGameButton } from '../components/StartGameButton';

export const NoGameInProgress: React.FC = () => {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          No Game in Progress
        </h1>
        <StartGameButton />
      </div>
    </main>
  );
};
