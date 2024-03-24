'use client';

import { useEffect, useState } from 'react';
import { fetchCurrentGameInfo } from '../network/fetchCurrentGameInfo';

const refreshInterval = 500;

export const useRefreshWhenGameStarts = () => {
  const [gameInProgress, setGameInProgress] = useState(false);

  const fetchGameInProgress = async () => {
    return (await fetchCurrentGameInfo()) != null;
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
