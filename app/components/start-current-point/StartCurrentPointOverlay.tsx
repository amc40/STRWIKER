import React from 'react';
import { StartCurrentPointButton } from './StartCurrentPointButton';

interface StartCurrentPointOverlayProps {
  registerGameStateMutation: () => string;
  clearGameStateMutation: () => void;
}

export const StartCurrentPointOverlay: React.FC<
  StartCurrentPointOverlayProps
> = ({ registerGameStateMutation, clearGameStateMutation }) => {
  return (
    <div className="flex justify-center items-center m-4">
      <StartCurrentPointButton
        registerGameStateMutation={registerGameStateMutation}
        clearGameStateMutation={clearGameStateMutation}
      />
    </div>
  );
};
