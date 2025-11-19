/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel serverless functions
  output: 'standalone',

  // Production optimizations
  swcMinify: true, // Use SWC for JS minification (faster than Terser)

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Enable experimental features for better optimization
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },

  // Production source maps (disable for smaller bundle)
  productionBrowserSourceMaps: false,

  // Enable image optimization with external domains
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers are now configured in vercel.json for better Vercel integration
}

module.exports = nextConfig
