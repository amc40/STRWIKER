import React from 'react';
import { Rotation } from './icons/Rotation';
import { RotatyStrategy } from '@prisma/client';

interface RotatyStatusProps {
  rotatyStrategy: RotatyStrategy;
}

export const RotatyStrategyStatus: React.FC<RotatyStatusProps> = ({
  rotatyStrategy,
}) => {
  return (
    <span>
      <Rotation />
      {rotatyStrategy}
    </span>
  );
};
