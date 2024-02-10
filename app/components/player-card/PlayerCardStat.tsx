import React from 'react';

interface PlayerCardStatProps {
  text: string;
}

export const PlayerCardStat: React.FC<PlayerCardStatProps> = ({ text }) => {
  return <p className="my-1 text-sm">{text}</p>;
};
