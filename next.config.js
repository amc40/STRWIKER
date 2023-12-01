const { queryComplexityPlugin } = require('nexus');
const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'avatar.vercel.sh']
  },
  experimental: {
    serverComponentsExternalPackages: ['@tremor/react'],
    serverActions: true
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/current-game',
        permanent: true
      }
    ];
  },
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: 'node_modules/vanilla-tilt/dist', to: '../public' },
          { from: 'app/images', to: '../public/images' }
        ]
      })
    );

    return config;
  }
};

module.exports = nextConfig;
