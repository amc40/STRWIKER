import React from 'react';
import { Button } from '@/components/ui/button';

interface PlayerCardGoalButtonProps {
  text: string;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export const PlayerCardGoalButton: React.FC<PlayerCardGoalButtonProps> = ({
  text,
  onClick,
  loading,
  disabled,
}) => {
  return (
    <Button size="sm" onClick={onClick} loading={loading} disabled={disabled}>
      {text}
    </Button>
  );
};
