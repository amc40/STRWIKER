import React, { useContext, useEffect, useState } from 'react';
import { StartCurrentPointOverlay } from '../start-current-point/StartCurrentPointOverlay';
import { GameStateContext } from '@/app/context/GameStateContext';
import ReactConfetti from 'react-confetti';

const FootballBanner: React.FC = () => (
  <div className="fixed top-1/2 left-1/2 banner-animation z-50">
    <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-green-700 p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border-[6px] border-white">
      {/* Soccer ball pattern top */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16">
        <div className="absolute w-full h-full bg-white rounded-full border-4 border-black" />
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXRoIGQ9Ik01MCw1IEw5NSw1MCBMNTAsOTUgTDUsNTAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] opacity-30" />
      </div>
      
      {/* Corner decorations */}
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full border-2 border-black transform rotate-45" />
      <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full border-2 border-black transform rotate-45" />
      <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full border-2 border-black transform rotate-45" />
      <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border-2 border-black transform rotate-45" />
      
      {/* Main text with shadow effect */}
      <div className="relative">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white text-center tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
          For the Fans
        </h1>
        {/* Subtle underline decoration */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-white opacity-50 rounded-full" />
      </div>
    </div>
  </div>
);

export const CurrentGameOverlay: React.FC = () => {
  const gameState = useContext(GameStateContext);
  const [showConfetti, setShowConfetti] = useState(false);

  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }

  const { pointStarted, redScore, blueScore } = gameState;

  useEffect(() => {
    if (redScore === 1 && blueScore === 1) {
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
        <>
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
          <FootballBanner />
        </>
      )}
      {!pointStarted && <StartCurrentPointOverlay />}
    </>
  );
};
