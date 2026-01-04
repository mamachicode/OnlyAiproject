/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // HARD disable Turbopack
  turbopack: false,

  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
