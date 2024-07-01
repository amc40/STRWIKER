'use client';
import React from 'react';
import { startGameWithPreviousPlayers } from '../../../lib/Game.actions';
import { PrimaryButton } from '../PrimaryButton';

export const StartGameWithPreviousPlayersButton: React.FC = () => {
  const onClick = async () => {
    try {
      await startGameWithPreviousPlayers();
    } catch {
      window.location.reload();
    }
  };

  return (
    <PrimaryButton
      text="Start Game with Previous Players"
      className="mt-8 text-md md:text-2xl font-bold"
      onClick={() => {
        onClick().catch((e) => {
          console.error('Error starting game with previous players:', e);
        });
      }}
    />
  );
};
