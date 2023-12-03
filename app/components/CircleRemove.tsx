import React from 'react';

interface CircleRemoveProps {
  onRemove: () => void;
}

export const CircleRemove: React.FC<CircleRemoveProps> = ({ onRemove }) => {
  return (
    <button
      onClick={onRemove}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 stroke-2"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6l8 8m0-8L6 14"
        />
      </svg>
    </button>
  );
};
