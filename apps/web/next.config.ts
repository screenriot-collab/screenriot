import { config } from 'dotenv';
import { join } from 'path';
import type { NextConfig } from 'next';

// Monorepo: shared .env at repo root (see README).
config({ path: join(__dirname, '../../.env') });

const nextConfig: NextConfig = {
  // Use standalone only in Docker (Linux). On Windows, next build may fail at trace step due to symlinks.
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' as const } : {}),
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/icon', permanent: false },
      { source: '/screenriot-logo.png', destination: '/images/screenriot-logo.png', permanent: false },
    ];
  },
};

export default nextConfig;
