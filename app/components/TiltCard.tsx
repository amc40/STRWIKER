'use client';

import { useRef, useEffect, type HTMLAttributes } from 'react';
import VanillaTilt, { type HTMLVanillaTiltElement } from 'vanilla-tilt';

export default function TiltCard({
  children,
  glare = true,
  maxGlare = 0.8,
  scale = 1.1,
  ...props
}: {
  glare?: boolean;
  maxGlare?: number;
  scale?: number;
} & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    VanillaTilt.init(el, { glare, 'max-glare': maxGlare, scale });
    return () => {
      (el as unknown as HTMLVanillaTiltElement).vanillaTilt.destroy();
    };
  }, [glare, maxGlare, scale]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
