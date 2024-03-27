import React from 'react';
import { PrimaryButton } from '../PrimaryButton';

interface PlayerCardGoalButtonProps {
  text: string;
  onClick: () => void;
  loading: boolean;
}

export const PlayerCardGoalButton: React.FC<PlayerCardGoalButtonProps> = (
  props,
) => {
  return <PrimaryButton className="text-sm" {...props} />;
};
