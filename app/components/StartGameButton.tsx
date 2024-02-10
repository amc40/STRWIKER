'use client';
import React from 'react';
import { startGame } from '../../lib/Game.actions';
import { PrimaryButton } from './PrimaryButton';

interface StartGameButtonProps {}

export const StartGameButton: React.FC<StartGameButtonProps> = ({}) => {
  const onClick = async () => {
    await startGame();
    window.location.reload();
  };

  return (
    <PrimaryButton
      text="Start Game"
      className="mt-8 text-xl font-bold"
      onClick={onClick}
    />
  );
};
