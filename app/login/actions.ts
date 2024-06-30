'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '../utils/supabase/server';

export async function login(formData: FormData) {
  const email = formData.get('email');
  if (email == null || typeof email !== 'string') {
    throw new Error('Email missing');
  }
  const supabase = createServerSupabase();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'http://localhost:3000/game/1/stats',
    },
  });

  if (error) {
    redirect('/error');
  }
}
