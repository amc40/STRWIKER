import React from 'react';
import { Rotation } from '../icons/Rotation';
import { RotatyStrategy } from '@prisma/client';
import { Button } from '@/components/ui/button';

interface RotatyStatusProps {
  rotatyStrategy: RotatyStrategy;
  onClick: () => void;
}

export const RotatyStrategyStatusButton: React.FC<RotatyStatusProps> = ({
  rotatyStrategy,
  onClick,
}) => {
  return (
    <Button variant="secondary" shape="badge" onClick={onClick}>
      <Rotation />
      {rotatyStrategy}
    </Button>
  );
};
