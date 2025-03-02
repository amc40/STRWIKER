import React from 'react';
import { Cross } from '../icons/Cross';
import { CircleButton } from './CircleButton';

interface CircleRemoveProps {
  onRemove: () => void;
}

export const CircleRemove: React.FC<CircleRemoveProps> = ({ onRemove }) => {
  return (
    <CircleButton onClick={onRemove} variant="destructive-outline">
      <Cross />
    </CircleButton>
  );
};
