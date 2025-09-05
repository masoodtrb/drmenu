import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize for production
  compress: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable experimental features for better performance
  experimental: {
    // Add experimental features here if needed
  },
};

export default nextConfig;
