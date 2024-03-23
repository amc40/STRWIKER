import React from 'react';
import { abandonCurrentGame } from '../../lib/Game.actions';

export const AbandonGameButton: React.FC = () => {
  return (
    <button
      onClick={() => {
        abandonCurrentGame().catch((error) => {
          console.error(`Error abandoning game: ${error}`);
        });
      }}
      className="p-1 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none"
    >
      Abandon Game
    </button>
  );
};
