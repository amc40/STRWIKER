import React from 'react';
import { StartCurrentPointButton } from './StartCurrentPointButton';

export const StartCurrentPointOverlay: React.FC = () => {
  return (
    <div className="flex justify-center items-center m-4">
      <StartCurrentPointButton />
    </div>
  );
};
