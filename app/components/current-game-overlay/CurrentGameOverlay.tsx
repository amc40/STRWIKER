import React, { useContext } from 'react';
import { StartCurrentPointOverlay } from '../start-current-point/StartCurrentPointOverlay';
import { GameStateContext } from '@/app/context/GameStateContext';

export const CurrentGameOverlay: React.FC = () => {
  const gameState = useContext(GameStateContext);

  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }

  const { pointStarted } = gameState;
  return <>{!pointStarted && <StartCurrentPointOverlay />}</>;
};
