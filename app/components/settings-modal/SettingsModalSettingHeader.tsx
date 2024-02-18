import React from 'react';

interface SettingTitleProps {
  title: string;
}

export const SettingsModalSettingHeader: React.FC<SettingTitleProps> = ({
  title
}) => {
  return (
    <>
      <hr className="my-2" />
      <h3 className="md:text-lg mb-1">{title}</h3>
    </>
  );
};
