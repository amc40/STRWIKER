import React from 'react';

interface PlayerCardGoalButtonProps {
  text: string;
  onClick: () => void;
}

export const PlayerCardGoalButton: React.FC<PlayerCardGoalButtonProps> = ({
  text,
  onClick
}) => {
  return (
    <button
      className="py-2 px-4 bg-goal text-sm rounded text-white"
      onClick={onClick}
    >
      {text}
    </button>
  );
};
