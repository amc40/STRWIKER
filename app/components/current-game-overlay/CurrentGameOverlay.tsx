import React, { useContext, useEffect, useState } from 'react';
import { StartCurrentPointOverlay } from '../start-current-point/StartCurrentPointOverlay';
import { GameStateContext } from '@/app/context/GameStateContext';
import ReactConfetti from 'react-confetti';

export const CurrentGameOverlay: React.FC = () => {
  const gameState = useContext(GameStateContext);
  const [showConfetti, setShowConfetti] = useState(false);

  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }

  const { pointStarted, redScore, blueScore } = gameState;

  useEffect(() => {
    if (redScore === 9 && blueScore === 9) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 6000); 
      return () => clearTimeout(timer);
    }
  }, [redScore, blueScore]);

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500} 
          recycle={false} 
          gravity={0.3} 
          initialVelocityY={30} 
          initialVelocityX={15} 
          tweenDuration={6000} 
          friction={0.95} 
          wind={0.05} 
          colors={['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF']} 
        />
      )}
      {!pointStarted && <StartCurrentPointOverlay />}
    </>
  );
};
