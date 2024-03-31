import React, { PropsWithChildren } from 'react';

export const StatsTH: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <th scope="col" className="py-3 px-6">
      {children}
    </th>
  );
};
