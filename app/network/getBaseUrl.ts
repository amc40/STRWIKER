export const getBaseUrl = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.BASE_URL != null) {
    return process.env.BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL != null) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  throw new Error('Either BASE_URL or VERCEL_URL must be set');
};
