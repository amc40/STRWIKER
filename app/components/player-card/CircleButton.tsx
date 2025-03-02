import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CircleButtonProps {
  className?: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
}

export const CircleButton: React.FC<
  React.PropsWithChildren<CircleButtonProps>
> = ({ children, className, onClick, variant = 'outline' }) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      variant={variant}
      className={cn('rounded-full', className)}
    >
      {children}
    </Button>
  );
};
