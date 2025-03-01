import React from 'react';
import { abandonCurrentGame } from '../../lib/Game.actions';
import { useMessage } from '../context/MessageContext';
import { Button } from '@/components/ui/button';

export const AbandonGameButton: React.FC = () => {
  const { addErrorMessage } = useMessage();
  return (
    <Button
      onClick={() => {
        abandonCurrentGame().catch((error: unknown) => {
          addErrorMessage('Error abandoning game', error);
        });
      }}
      variant="destructive-outline"
      size="sm"
    >
      Abandon Game
    </Button>
  );
};
