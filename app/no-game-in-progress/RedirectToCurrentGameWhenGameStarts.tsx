'use client';
import React, { useEffect } from 'react';
import { supabaseClient } from '../utils/supabase';
import { useRouter } from 'next/navigation';

export const RedirectToCurrentGameWhenGameStarts: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const taskListener = supabaseClient
      .channel('current-game')
      .on('broadcast', { event: 'game-start' }, () => {
        router.replace('/current-game');
      })
      .subscribe();

    return () => void taskListener.unsubscribe();
  }, [router]);

  return <></>;
};
