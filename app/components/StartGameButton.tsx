'use client';
import React from 'react';
import { startGame } from '../../lib/Game.actions';

interface StartGameButtonProps {}

export const StartGameButton: React.FC<StartGameButtonProps> = ({}) => {
  const onClick = async () => {
    await startGame();
    window.location.reload();
  };

  return (
    <button
      onClick={onClick}
      className="mt-8 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-xl"
    >
      Start Game
    </button>
  );
};
