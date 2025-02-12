import React from 'react';
import { abandonCurrentGame } from '../../lib/Game.actions';
import { useMessage } from '../context/MessageContext';

export const AbandonGameButton: React.FC = () => {
  const { addErrorMessage } = useMessage();
  return (
    <button
      onClick={() => {
        abandonCurrentGame().catch((error: unknown) => {
          addErrorMessage('Error abandoning game', error);
        });
      }}
      className="p-1 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none"
    >
      Abandon Game
    </button>
  );
};
