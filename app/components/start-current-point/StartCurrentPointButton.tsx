import React from 'react';
import { useMessage } from '../../context/MessageContext';
import { startCurrentPoint } from '../../../lib/Game.actions';
import { Button } from '@/components/ui/button';

interface StartCurrentPointButtonProps {
  registerGameStateMutation: () => string;
  clearGameStateMutation: () => void;
}

export const StartCurrentPointButton: React.FC<
  StartCurrentPointButtonProps
> = ({ registerGameStateMutation, clearGameStateMutation }) => {
  const onClick = async () => {
    await startCurrentPoint(registerGameStateMutation());
  };

  const { addErrorMessage } = useMessage();

  return (
    <Button
      size="lg"
      onClick={() => {
        onClick().catch((e: unknown) => {
          clearGameStateMutation();
          addErrorMessage('Error starting point', e);
        });
      }}
    >
      Start Point
    </Button>
  );
};
