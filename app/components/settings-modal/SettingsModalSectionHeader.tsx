import React from 'react';

interface SettingsModalSectionHeaderProps {
  title: string;
}

export const SettingsModalSectionHeader: React.FC<
  SettingsModalSectionHeaderProps
> = ({ title }) => {
  return (
    <>
      <hr className="my-6 border-slate-500" />
      <h2 className="md:text-lg font-bold mb-1">{title}</h2>
    </>
  );
};
