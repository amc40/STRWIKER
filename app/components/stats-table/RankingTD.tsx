import React from 'react';
import { StatsTD } from './StatsTD';

interface EmojiMedalsTDProps {
  index: number;
}

export const EmojiMedalsTD: React.FC<EmojiMedalsTDProps> = ({ index }) => {
  return (
    <StatsTD className="w-1 px-1 text-center">
      {index === 0 ? <span className="text-xl">🥇</span> : null}
      {index === 1 ? <span className="text-xl">🥈</span> : null}
      {index === 2 ? <span className="text-xl">🥉</span> : null}
      {index > 2 ? <span>{index + 1}</span> : null}
    </StatsTD>
  );
};
