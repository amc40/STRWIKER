import { RotatyStrategy, Team } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { updateRotatyStrategyAction } from '../../../lib/Game.actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMessage } from '../../context/MessageContext';

interface RotationStrategySelectorProps {
  team: Team;
  rotatyStrategy: RotatyStrategy;
  setRotatyStrategy: (team: Team, rotatyStrategy: RotatyStrategy) => void;
  registerGameStateMutation: () => string;
  clearGameStateMutation: () => void;
}

const options = Object.values(RotatyStrategy);

export const RotatyStrategySelector: React.FC<
  RotationStrategySelectorProps
> = ({
  team,
  rotatyStrategy,
  setRotatyStrategy,
  registerGameStateMutation,
  clearGameStateMutation,
}) => {
  const [selectedRotatyStrategy, setSelectedRotatyStrategy] =
    useState<RotatyStrategy>(rotatyStrategy);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedRotatyStrategy(rotatyStrategy);
  }, [rotatyStrategy]);

  const { addErrorMessage } = useMessage();

  const updateRotatyStrategy = (rotatyStrategy: RotatyStrategy) => {
    setLoading(true);
    const updateRotatyStrategyPromise = async () => {
      try {
        const mutationId = registerGameStateMutation();
        await updateRotatyStrategyAction(rotatyStrategy, team, mutationId);
        setSelectedRotatyStrategy(rotatyStrategy);
        setRotatyStrategy(team, rotatyStrategy);
      } finally {
        setLoading(false);
      }
    };
    updateRotatyStrategyPromise().catch((e: unknown) => {
      clearGameStateMutation();
      addErrorMessage('Error updating rotaty strategy', e);
    });
  };

  return (
    <Select
      value={selectedRotatyStrategy}
      onValueChange={(value) => {
        updateRotatyStrategy(value as RotatyStrategy);
      }}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={loading ? 'Loading...' : 'Select a strategy'}
        />
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
