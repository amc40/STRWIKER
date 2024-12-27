import React from 'react';
import { PrimaryButton } from '../PrimaryButton';
import { useMessage } from '../../context/MessageContext';

export const StartCurrentPointButton: React.FC = () => {
  const onClick = async () => {
    // TODO: add action
  };

  const { addErrorMessage } = useMessage();

  return (
    <PrimaryButton
      text="Start Point"
      className="text-md md:text-2xl font-bold"
      onClick={() => {
        onClick().catch((e) => {
          addErrorMessage('Error starting point', e);
        });
      }}
    />
  );
};
