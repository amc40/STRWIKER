import classNames from 'classnames';
import React from 'react';

interface CircleButtonProps {
  className?: string;
  onClick: () => void;
}

export const CircleButton: React.FC<
  React.PropsWithChildren<CircleButtonProps>
> = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        className,
        'flex items-center justify-center w-8 h-8 rounded-full border focus:outline-none',
      )}
    >
      {children}
    </button>
  );
};
