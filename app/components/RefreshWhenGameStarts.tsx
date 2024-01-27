'use client';

import React from 'react';
import { useRefreshWhenGameStarts } from '../hooks/refreshWhenGameStarts';

interface RefreshWhenGameStartsProps {}

export const RefreshWhenGameStarts: React.FC<
  RefreshWhenGameStartsProps
> = ({}) => {
  useRefreshWhenGameStarts();
  return null;
};
