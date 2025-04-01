import { useRouter } from 'next/router';
import { supabaseClient } from '../utils/supabase';
import { useCallback, useEffect } from 'react';

export const useGameEndListener = (gameId: number) => {
  const router = useRouter();

  const navigateToGameStats = useCallback(() => {
    void router.replace(`/game/${gameId.toFixed()}/stats`);
  }, [gameId, router]);

  useEffect(() => {
    const gameEndListener = supabaseClient
      .channel('current-game-end')
      .on('broadcast', { event: 'game-end' }, () => {
        navigateToGameStats();
      })
      .subscribe();

    return () => {
      void gameEndListener.unsubscribe();
    };
  }, [navigateToGameStats]);
};
