/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hard override Next 16 turbopack auto-enable
  turbopack: {},

  webpack: (config) => config,
};

module.exports = nextConfig;
