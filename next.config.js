/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },

  reactStrictMode: false,

  swcMinify: true,

  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024,
  },
};

module.exports = nextConfig;
