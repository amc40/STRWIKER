declare namespace NodeJS {
  export interface ProcessEnv {
    POSTGRES_PRISMA_URL: string;
    POSTGRES_URL_NON_POOLING: string;

    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
