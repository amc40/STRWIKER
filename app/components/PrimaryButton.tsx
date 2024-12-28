import React from 'react';
import { Spinner } from './icons/Spinner';
import classNames from 'classnames';

export interface PrimaryButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onClick,
  className,
  loading = false,
  disabled = false,
}) => {
  const baseButtonClassNames =
    'py-2 px-4 bg-primary hover:bg-green-700 rounded min-w-[60px] text-white flex justify-center items-center';
  const loadingClassName = loading ? 'opacity-50' : '';
  const disabledClassName = disabled ? 'opacity-50' : '';

  const allClassNames = classNames(
    className,
    baseButtonClassNames,
    loadingClassName,
    disabledClassName,
  );

  return (
    <button className={allClassNames} disabled={disabled} onClick={onClick}>
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
