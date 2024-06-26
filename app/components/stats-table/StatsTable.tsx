import React, { PropsWithChildren } from 'react';

export const StatsTable: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      {children}
    </table>
  );
};
