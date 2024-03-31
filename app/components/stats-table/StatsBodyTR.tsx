import React, { PropsWithChildren } from 'react';

export const StatsTR: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
      {children}
    </tr>
  );
};
