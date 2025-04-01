'use client';
import { createContext } from 'react';
import { GameInfo } from '../view/GameInfo';
import { GameStateWithMutations, useGameState } from '../hooks/useGameState';

export const GameStateContext = createContext<GameStateWithMutations | null>(
  null,
);

interface GameStateProviderProps {
  initialGameInfo: GameInfo;
}

export const GameStateProvider: React.FC<
  React.PropsWithChildren<GameStateProviderProps>
> = ({ children, initialGameInfo }) => {
  const gameStateWithMutations = useGameState(initialGameInfo);

  return (
    <GameStateContext.Provider value={gameStateWithMutations}>
      {children}
    </GameStateContext.Provider>
  );
};
