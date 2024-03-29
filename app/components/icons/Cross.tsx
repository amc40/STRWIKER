import React from 'react';

export const Cross: React.FC = () => {
  return (
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
  );
};
