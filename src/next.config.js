/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Canonical Next 16 production config
  turbopack: {},
  webpack: (config) => config,
};

module.exports = nextConfig;
