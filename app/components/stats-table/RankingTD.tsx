import React from 'react';
import { StatsTD } from './StatsTD';

interface EmojiMedalsTDProps {
  // 0-indexed
  ranking: number;
}

export const EmojiMedalsTD: React.FC<EmojiMedalsTDProps> = ({ ranking }) => {
  return (
    <StatsTD className="w-1 px-1 text-center">
      {ranking === 1 ? <span className="text-xl">🥇</span> : null}
      {ranking === 2 ? <span className="text-xl">🥈</span> : null}
      {ranking === 3 ? <span className="text-xl">🥉</span> : null}
      {ranking > 3 ? <span>{ranking}</span> : null}
    </StatsTD>
  );
};
