import { RotatyStrategy, Team } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import {
  getRotatyStrategy,
  updateRotatyStrategyAction,
} from '../../../lib/Game.actions';
import { Select, SelectOption } from '../Select';

interface RotationStrategySelectorProps {
  team: Team;
}

const options: SelectOption<RotatyStrategy>[] = Object.values(
  RotatyStrategy,
).map((rotatyStrategy) => ({
  id: rotatyStrategy,
  label: rotatyStrategy,
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
    fetchCurrentRotatyStrategy().catch((e) => {
      console.error(
        `Error fetching current rotation strategy for ${team} team:`,
        e,
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRotatyStrategy = (rotatyStrategy: RotatyStrategy) => {
    setLoading(true);
    const updateRotatyStrategyPromise = async () => {
      try {
        await updateRotatyStrategyAction(rotatyStrategy, team);
        setSelectedRotatyStrategy(rotatyStrategy);
        // TODO: show configmration
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
