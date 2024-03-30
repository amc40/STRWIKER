import React from 'react';
import { RotatyStrategyStatusButton } from './RotationStrategyStatus';
import { RotatyStrategy, Team } from '@prisma/client';

interface TeamHeaderProps {
  team: Team;
  rotatyStrategy: RotatyStrategy;
  score: number;
  openSettingsModal: () => void;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({
  team,
  rotatyStrategy,
  score,
  openSettingsModal,
}) => {
  return (
    <div className={'flex'}>
      <div className="flex flex-col justify-start">
        <div className="flex items-center">
          <h2 className="text-2xl">Team {team}</h2>
          <span className="ml-2 flex items-center">
            <RotatyStrategyStatusButton
              rotatyStrategy={rotatyStrategy}
              onClick={openSettingsModal}
            />
          </span>
        </div>
      </div>
      <span className={'flex-grow text-right text-5xl'}>{score}</span>
    </div>
  );
};
