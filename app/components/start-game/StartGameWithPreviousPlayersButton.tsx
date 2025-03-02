'use client';
import React from 'react';
import { startGameWithPreviousPlayers } from '../../../lib/Game.actions';
import { useMessage } from '../../context/MessageContext';
import { Button } from '@/components/ui/button';

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
    <Button
      size="lg"
      className="mt-8"
      onClick={() => {
        onClick().catch((e: unknown) => {
          addErrorMessage('Error starting game with previous players', e);
        });
      }}
    >
      Start Game with Previous Players
    </Button>
  );
};
