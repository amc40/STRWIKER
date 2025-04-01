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

  const { pointStarted, teamInfo } = gameState;
  const redScore = teamInfo.Red.score;
  const blueScore = teamInfo.Blue.score;

  useEffect(() => {
    if (redScore === 9 && blueScore === 9) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [redScore, blueScore]);

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      {!pointStarted && <StartCurrentPointOverlay />}
    </>
  );
};
