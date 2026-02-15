/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  experimental: {
    // Preserve Next.js 14 client router cache behavior:
    // In Next.js 15+, staleTime defaults to 0 (no client caching).
    // Setting these values restores the Next.js 14 caching behavior.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/current-game',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
