'use client';
import React from 'react';
import { startGameWithPreviousPlayers } from '../../../lib/Game.actions';
import { PrimaryButton } from '../PrimaryButton';
import { useMessage } from '../../context/MessageContext';

export const StartGameWithPreviousPlayersButton: React.FC = () => {
  const onClick = async () => {
    try {
      await startGameWithPreviousPlayers();
    } catch {
      window.location.reload();
    }
  };

  const { addErrorMessage } = useMessage();

  return (
    <PrimaryButton
      text="Start Game with Previous Players"
      className="mt-8 text-md md:text-2xl font-bold"
      onClick={() => {
        onClick().catch((e) => {
          addErrorMessage('Error starting game with previous players', e);
        });
      }}
    />
  );
};
