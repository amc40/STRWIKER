 
import React from 'react';
import Image from 'next/image';

export const Logo: React.FC = () => {
  return (
    <Image
      src="../icon.svg"
      alt="STRWIKER Logo"
      width={32}
      height={32}
      priority
    />
  );
};
