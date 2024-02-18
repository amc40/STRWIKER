import { RotatyStrategy, Team } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import {
  getRotatyStrategy,
  updateRotatyStrategyAction
} from '../../../lib/Game.actions';
import { Select, SelectOption } from '../Select';

interface RotationStrategySelectorProps {
  team: Team;
}

const options: SelectOption<RotatyStrategy>[] = Object.values(
  RotatyStrategy
).map((rotatyStrategy) => ({
  id: rotatyStrategy,
  label: rotatyStrategy
}));

export const RotatyStrategySelector: React.FC<
  RotationStrategySelectorProps
> = ({ team }) => {
  const [selectedRotatyStrategy, setSelectedRotatyStrategy] = useState<
    RotatyStrategy | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentRotatyStrategy = async () => {
      const currentRotatyStrategy = await getRotatyStrategy(team);
      console.log('current rotaty strategy', currentRotatyStrategy);
      setSelectedRotatyStrategy(currentRotatyStrategy);
      setLoading(false);
    };
    fetchCurrentRotatyStrategy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRotatyStrategy = async (rotatyStrategy: RotatyStrategy) => {
    setLoading(true);
    try {
      await updateRotatyStrategyAction(rotatyStrategy, team);
      setSelectedRotatyStrategy(rotatyStrategy);
      // TODO: show configmration
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      options={options}
      selectedId={selectedRotatyStrategy}
      onChange={(rotatyStrategy) => updateRotatyStrategy(rotatyStrategy)}
      loading={loading}
    />
  );
};
