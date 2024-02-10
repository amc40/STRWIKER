import React from 'react';
import { abandonCurrentGame } from '../../lib/Game.actions';

interface AbandonGameButtonProps {}

export const AbandonGameButton: React.FC<AbandonGameButtonProps> = ({}) => {
  return (
    <button
      onClick={() => abandonCurrentGame()}
      className="p-1 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none"
    >
      Abandon Game
    </button>
  );
};
