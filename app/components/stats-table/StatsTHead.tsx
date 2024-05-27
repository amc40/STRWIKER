import React, { PropsWithChildren } from 'react';

export const StatsTHead: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      {children}
    </thead>
  );
};
