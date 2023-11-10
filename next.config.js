const { queryComplexityPlugin } = require('nexus');
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'avatar.vercel.sh']
  },
  experimental: {
    serverComponentsExternalPackages: ['@tremor/react']
  },
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: "node_modules/vanilla-tilt/dist", to: "../public" }
        ]
      })
    )

    return config;
  }
};

module.exports = nextConfig;
