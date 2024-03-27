import React from 'react';
import { Spinner } from './icons/Spinner';

export interface PrimaryButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onClick,
  className,
  loading,
}) => {
  return (
    <button
      className={`${className} py-2 px-4 bg-primary hover:bg-green-700 rounded min-w-[60px] text-white flex justify-center items-center ${
        loading ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      {loading ? (
        <div>
          <Spinner />
        </div>
      ) : (
        text
      )}
    </button>
  );
};
