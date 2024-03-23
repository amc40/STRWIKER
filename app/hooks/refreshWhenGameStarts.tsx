'use client';

import { useEffect } from 'react';
import { getCurrentGameInfo } from '../../lib/Game.actions';

const refreshInterval = 500;

export const useRefreshWhenGameStarts = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentGame = await getCurrentGameInfo();
      if (currentGame.gameInProgress) {
        window.location.reload();
      }
    }, refreshInterval);
    return () => { clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
