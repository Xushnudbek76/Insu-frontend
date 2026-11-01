/** @type {import('next').NextConfig} */
import i18nextConfig from './next-i18next.config.js';

const nextConfig = {
  reactStrictMode: true,
  i18n: i18nextConfig.i18n,
  output: 'standalone',
  // Engine.IO's WebSocket upgrade must reach the proxy without an HTTP redirect.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const api = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007').replace(/\/$/, '');
    return [
      { source: '/api/graphql', destination: `${api}/graphql` },
      { source: '/api/auth/:path*', destination: `${api}/auth/:path*` },
      { source: '/socket.io/:path*', destination: `${api}/socket.io/` },
    ];
  },
};

export default nextConfig;
