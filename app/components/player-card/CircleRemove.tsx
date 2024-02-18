import React from 'react';
import { Cross } from '../icons/Cross';

interface CircleRemoveProps {
  onRemove: () => void;
}

export const CircleRemove: React.FC<CircleRemoveProps> = ({ onRemove }) => {
  return (
    <button
      onClick={onRemove}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none"
    >
      <Cross />
    </button>
  );
};
