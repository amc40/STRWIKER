import { RotatyStrategy, Team } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { updateRotatyStrategyAction } from '../../../lib/Game.actions';
import { Select, SelectOption } from '../Select';

interface RotationStrategySelectorProps {
  team: Team;
  rotatyStrategy: RotatyStrategy;
  setRotatyStrategy: (team: Team, rotatyStrategy: RotatyStrategy) => void;
}

const options: SelectOption<RotatyStrategy>[] = Object.values(
  RotatyStrategy,
).map((rotatyStrategy) => ({
  id: rotatyStrategy,
  label: rotatyStrategy,
}));

export const RotatyStrategySelector: React.FC<
  RotationStrategySelectorProps
> = ({ team, rotatyStrategy, setRotatyStrategy }) => {
  const [selectedRotatyStrategy, setSelectedRotatyStrategy] =
    useState<RotatyStrategy>(rotatyStrategy);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedRotatyStrategy(rotatyStrategy);
  }, [rotatyStrategy]);

  const updateRotatyStrategy = (rotatyStrategy: RotatyStrategy) => {
    setLoading(true);
    const updateRotatyStrategyPromise = async () => {
      try {
        await updateRotatyStrategyAction(rotatyStrategy, team);
        setSelectedRotatyStrategy(rotatyStrategy);
        setRotatyStrategy(team, rotatyStrategy);
        // TODO: show confirmation
      } finally {
        setLoading(false);
      }
    };
    updateRotatyStrategyPromise().catch((e) => {
      console.error('Error updating rotaty strategy:', e);
    });
  };

  return (
    <Select
      options={options}
      selectedId={selectedRotatyStrategy}
      onChange={(rotatyStrategy) => {
        updateRotatyStrategy(rotatyStrategy);
      }}
      loading={loading}
    />
  );
};
