import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence turbopack vs webpack conflict by explicitly declaring turbopack config
  turbopack: {},

  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "src"),
    };
    return config;
  },
};

export default nextConfig;
