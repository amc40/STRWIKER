import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl == null) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL`,
  );
}

if (supabaseAnonKey == null) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  );
}

export const createServerSupabase = () => {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          cookieStore.set(name, value, options),
        );
      },
    },
  });
};
