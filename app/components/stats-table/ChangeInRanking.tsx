import React from 'react';

interface ChangeInRankingProps {
  changeInRanking?: number | null;
}

export const ChangeInRanking: React.FC<ChangeInRankingProps> = ({
  changeInRanking,
}) => {
  if (changeInRanking == null || changeInRanking === 0) {
    return null;
  }

  const isIncrease = changeInRanking > 0;
  const changeText = `(${Math.abs(changeInRanking)}${
    isIncrease ? '⬆️' : '⬇️'
  })`;

  return (
    <span className={` ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
      {changeText}
    </span>
  );
};
