/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel serverless functions
  output: 'standalone',

  // Production optimizations
  swcMinify: true, // Enable SWC-based minification (default in Next.js 14, but explicit is better)

  // Compiler optimizations for production
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Production-specific settings
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  // Optimize JavaScript bundles
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },

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

  // Compiler optimizations for modern browsers
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for better optimization
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-slider',
      'date-fns',
    ],
  },

  // Webpack configuration for modern output
  webpack: (config, { isServer }) => {
    // Target modern browsers with ES2020+ features
    config.target = isServer ? 'node16' : ['web', 'es2020'];

    return config;
  },

  // Headers are now configured in vercel.json for better Vercel integration
}

module.exports = nextConfig
