import React from 'react';

interface SettingsModalDescriptionProps {
  text: string;
}

export const SettingsModalDescription: React.FC<
  SettingsModalDescriptionProps
> = ({ text }) => {
  return <p className="text-sm mb-1 hidden md:inline">{text}</p>;
};
