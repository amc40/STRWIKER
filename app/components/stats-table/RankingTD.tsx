import React from 'react';
import { StatsTD } from './StatsTD';
import { ChangeInRanking } from './ChangeInRanking';

interface EmojiMedalsTDProps {
  // 0-indexed
  ranking: number;
  changeInRanking?: number | null;
}

export const EmojiMedalsTD: React.FC<EmojiMedalsTDProps> = ({
  ranking,
  changeInRanking,
}) => {
  return (
    <StatsTD
      className={`${changeInRanking != null ? 'w-20' : 'w-1'} pl-4 text-center`}
    >
      <div className="flex justify-between">
        {ranking === 1 ? <span className="text-xl">🥇</span> : null}
        {ranking === 2 ? <span className="text-xl">🥈</span> : null}
        {ranking === 3 ? <span className="text-xl">🥉</span> : null}
        {ranking > 3 ? <span>{ranking}</span> : null}
        <ChangeInRanking changeInRanking={changeInRanking} />
      </div>
    </StatsTD>
  );
};
