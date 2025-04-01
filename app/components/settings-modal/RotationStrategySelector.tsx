import { RotatyStrategy, Team } from '@prisma/client';
import React, { useContext } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GameStateContext } from '@/app/context/GameStateContext';

interface RotationStrategySelectorProps {
  team: Team;
}

const options = Object.values(RotatyStrategy);

export const RotatyStrategySelector: React.FC<
  RotationStrategySelectorProps
> = ({ team }) => {
  const gameState = useContext(GameStateContext);
  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }

  const { blueRotatyStrategy, redRotatyStrategy, updateRotatyStrategy } =
    gameState;
  const selectedRotatyStrategy =
    team === Team.Red ? redRotatyStrategy : blueRotatyStrategy;

  return (
    <Select
      value={selectedRotatyStrategy}
      onValueChange={(value) => {
        updateRotatyStrategy(team, value as RotatyStrategy);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a strategy" />
      </SelectTrigger>
      <SelectContent>
        {options.map((strategy) => (
          <SelectItem key={strategy} value={strategy}>
            {strategy}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
