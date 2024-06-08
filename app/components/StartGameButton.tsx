'use client';
import React from 'react';
import { startGame } from '../../lib/Game.actions';
import { PrimaryButton } from './PrimaryButton';

export const StartGameButton: React.FC = () => {
  const onClick = async () => {
    await startGame();
  };

  return (
    <PrimaryButton
      text="Start Game"
      className="mt-8 text-xl font-bold"
      onClick={() => {
        onClick().catch((e) => {
          console.error('Error starting game:', e);
        });
      }}
    />
  );
};
