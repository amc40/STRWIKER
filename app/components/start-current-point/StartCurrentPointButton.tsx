import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { GameStateContext } from '@/app/context/GameStateContext';

export const StartCurrentPointButton: React.FC = () => {
  const gameState = useContext(GameStateContext);
  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }
  const { startCurrentPoint } = gameState;

  return (
    <Button
      size="lg"
      onClick={() => {
        startCurrentPoint();
      }}
    >
      Start Point
    </Button>
  );
};
