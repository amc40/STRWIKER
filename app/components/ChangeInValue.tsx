import React from 'react';

interface ChangeInValueProps {
  changeInValue?: number | null;
}

export const ChangeInValue: React.FC<ChangeInValueProps> = ({
  changeInValue,
}) => {
  if (changeInValue == null || changeInValue === 0) {
    return null;
  }

  const isIncrease = changeInValue > 0;
  const changeText = `(${isIncrease ? '+' : '-'}${Math.abs(changeInValue).toFixed()})`;

  return (
    <span className={` ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
      {changeText}
    </span>
  );
};
