import React from 'react';

interface PrimaryButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onClick,
  className
}) => {
  return (
    <button
      className={`${className} py-2 px-4 bg-primary hover:bg-green-700 rounded text-white`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
