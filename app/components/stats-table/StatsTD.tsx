import React, { PropsWithChildren } from 'react';

export const StatsTD: React.FC<
  PropsWithChildren<Partial<React.HTMLProps<HTMLTableCellElement>>>
> = (props) => {
  const { children, className } = props;
  return (
    <td {...props} className={`${className} py-4 px-6`}>
      {children}
    </td>
  );
};
