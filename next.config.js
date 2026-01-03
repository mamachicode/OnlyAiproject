/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack(config) {
    // HARD BIND APP ROUTER ROOT
    config.resolve.alias['@/app'] = require('path').resolve(__dirname, 'src/app')
    config.resolve.alias['@/components'] = require('path').resolve(__dirname, 'src/components')
    config.resolve.alias['@/lib'] = require('path').resolve(__dirname, 'src/lib')
    return config
  },
}

module.exports = nextConfig
