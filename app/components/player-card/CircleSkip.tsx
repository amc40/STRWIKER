import React from 'react';
import { CircleButton } from './CircleButton';
import { Skip } from '../icons/Skip';

interface CircleSkipProps {
  skipped: boolean;
  onSkip: () => void;
}

export const CircleSkip: React.FC<CircleSkipProps> = ({ skipped, onSkip }) => {
  return (
    <CircleButton
      onClick={onSkip}
      className={
        skipped
          ? 'bg-blue-500 text-white hover:bg-blue-400'
          : 'border-blue-500 text-blue-500 hover:bg-blue-100'
      }
    >
      <Skip />
    </CircleButton>
  );
};
