'use client';

import React from 'react';
import { useRefreshWhenGameStarts } from '../hooks/refreshWhenGameStarts';

export const RefreshWhenGameStarts: React.FC = () => {
  useRefreshWhenGameStarts();
  return null;
};
