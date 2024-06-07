import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (supabaseUrl == null) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL`,
  );
}

if (supabaseKey == null) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_SUPABASE_KEY`,
  );
}
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
