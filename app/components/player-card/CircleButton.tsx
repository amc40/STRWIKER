import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CircleButtonProps {
  className?: string;
  onClick: () => void;
}

export const CircleButton: React.FC<
  React.PropsWithChildren<CircleButtonProps>
> = ({ children, className, onClick }) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="outline"
      className={cn('rounded-full', className)}
    >
      {children}
    </Button>
  );
};
