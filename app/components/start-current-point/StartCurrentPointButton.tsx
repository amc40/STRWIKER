import React from 'react';
import { useMessage } from '../../context/MessageContext';
import { startCurrentPoint } from '../../../lib/Game.actions';
import { Button } from '@/components/ui/button';

export const StartCurrentPointButton: React.FC = () => {
  const onClick = async () => {
    await startCurrentPoint();
  };

  const { addErrorMessage } = useMessage();

  return (
    <Button
      size="lg"
      onClick={() => {
        onClick().catch((e: unknown) => {
          addErrorMessage('Error starting point', e);
        });
      }}
    >
      Start Point
    </Button>
  );
};
