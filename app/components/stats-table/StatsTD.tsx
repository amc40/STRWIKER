import React, { PropsWithChildren } from 'react';

export const StatsTD: React.FC<PropsWithChildren> = ({ children }) => {
  return <td className="py-4 px-6">{children}</td>;
};
