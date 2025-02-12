import React from 'react';
import { PrimaryButton } from '../PrimaryButton';
import { useMessage } from '../../context/MessageContext';
import { startCurrentPoint } from '../../../lib/Game.actions';

export const StartCurrentPointButton: React.FC = () => {
  const onClick = async () => {
    await startCurrentPoint();
  };

  const { addErrorMessage } = useMessage();

  return (
    <PrimaryButton
      text="Start Point"
      className="text-md md:text-2xl font-bold"
      onClick={() => {
        onClick().catch((e: unknown) => {
          addErrorMessage('Error starting point', e);
        });
      }}
    />
  );
};
