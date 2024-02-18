import React from 'react';
import { Cog } from './icons/Cog';

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-300 rounded-full p-2 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 ring-2 ring-gray-600"
    >
      <Cog />
    </button>
  );
};

export default SettingsButton;
