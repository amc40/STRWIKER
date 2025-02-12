'use client';
import React from 'react';
import { startFreshGame } from '../../../lib/Game.actions';
import { PrimaryButton } from '../PrimaryButton';
import { useMessage } from '../../context/MessageContext';

export const StartFreshGameButton: React.FC = () => {
  const onClick = async () => {
    try {
      await startFreshGame();
    } catch {
      window.location.reload();
    }
  };

  const { addErrorMessage } = useMessage();

  return (
    <PrimaryButton
      text="Start Fresh Game"
      className="mt-8 text-md md:text-2xl font-bold"
      onClick={() => {
        onClick().catch((e: unknown) => {
          addErrorMessage('Error starting fresh game', e);
        });
      }}
    />
  );
};
