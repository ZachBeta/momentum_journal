/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // If client-side, don't include server-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sqlite3: false,
        'better-sqlite3': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
