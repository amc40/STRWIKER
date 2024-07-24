import React, { PropsWithChildren } from 'react';

export const StatsTH: React.FC<
  PropsWithChildren<Partial<React.HTMLProps<HTMLTableCellElement>>>
> = (props) => {
  const { children, className } = props;
  return (
    <th {...props} scope="col" className={className ?? `py-3 px-2 md:px-6`}>
      {children}
    </th>
  );
};
