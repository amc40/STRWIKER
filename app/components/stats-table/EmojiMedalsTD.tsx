import React from 'react';
import { StatsTD } from './StatsTD';

interface EmojiMedalsTDProps {
  index: number;
}

export const EmojiMedalsTD: React.FC<EmojiMedalsTDProps> = ({ index }) => {
  return (
    <StatsTD className="w-1 px-1 text-center text-xl">
      {index === 0 ? <span>🥇</span> : null}
      {index === 1 ? <span>🥈</span> : null}
      {index === 2 ? <span>🥉</span> : null}
    </StatsTD>
  );
};
