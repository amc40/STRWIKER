import React from 'react';
import { Cross } from '../icons/Cross';
import { CircleButton } from './CircleButton';

interface CircleRemoveProps {
  onRemove: () => void;
}

export const CircleRemove: React.FC<CircleRemoveProps> = ({ onRemove }) => {
  return (
    <CircleButton
      onClick={onRemove}
      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
    >
      <Cross />
    </CircleButton>
  );
};
