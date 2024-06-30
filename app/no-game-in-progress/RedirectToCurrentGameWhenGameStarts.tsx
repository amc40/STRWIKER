'use client';
import React, { useEffect } from 'react';
import { createClientSupabase } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';

export const RedirectToCurrentGameWhenGameStarts: React.FC = () => {
  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    const taskListener = supabase
      .channel('current-game-start')
      .on('broadcast', { event: 'game-start' }, () => {
        router.replace('/current-game');
      })
      .subscribe();

    return () => void taskListener.unsubscribe();
  }, [router, supabase]);

  return <></>;
};
