'use client';

import { useEffect, useState } from 'react';
import { getCurrentGameInfo } from '../../lib/Game.actions';

const refreshInterval = 500;

export const useRefreshWhenGameStarts = () => {
  const [gameInProgress, setGameInProgress] = useState(false);

  const fetchGameInProgress = async () => {
    return (await getCurrentGameInfo()).gameInProgress;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchGameInProgress()
        .then((gameInProgress) => {
          setGameInProgress(gameInProgress);
        })
        .catch((e) => {
          console.error('Error fetching gameInProgress:', e);
        });
    }, refreshInterval);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (gameInProgress) {
      window.location.reload();
    }
  }, [gameInProgress]);
};
