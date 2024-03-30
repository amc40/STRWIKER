import React from 'react';
import { Rotation } from '../icons/Rotation';
import { RotatyStrategy } from '@prisma/client';

interface RotatyStatusProps {
  rotatyStrategy: RotatyStrategy;
  onClick: () => void;
}

export const RotatyStrategyStatusButton: React.FC<RotatyStatusProps> = ({
  rotatyStrategy,
  onClick,
}) => {
  return (
    <button
      className="flex items-center gap-x-0.5 bg-secondary text-black text-base font-normal border border-black rounded-full px-2"
      onClick={() => {
        onClick();
      }}
    >
      <Rotation />
      {rotatyStrategy}
    </button>
  );
};
