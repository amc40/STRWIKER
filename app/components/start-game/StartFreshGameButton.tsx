'use client';
import React from 'react';
import { startFreshGame } from '../../../lib/Game.actions';
import { useMessage } from '../../context/MessageContext';
import { Button } from '@/components/ui/button';

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
    <Button
      size="lg"
      className="mt-8"
      onClick={() => {
        onClick().catch((e: unknown) => {
          addErrorMessage('Error starting fresh game', e);
        });
      }}
    >
      Start Fresh Game
    </Button>
  );
};
