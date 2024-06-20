import { createClient } from '@supabase/supabase-js';

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
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
