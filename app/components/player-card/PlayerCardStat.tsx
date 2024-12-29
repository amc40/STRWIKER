import React from 'react';

interface PlayerCardStatProps {
  text: string;
}

export const PlayerCardStat: React.FC<PlayerCardStatProps> = ({ text }) => {
  return <p className="text-sm">{text}</p>;
};
