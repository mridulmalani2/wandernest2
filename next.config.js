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

  // Webpack configuration for enhanced source map control
  webpack: (config, { dev, isServer }) => {
    // Configure source maps for production builds
    if (!dev) {
      config.devtool = 'source-map';

      // Ensure source maps are generated for all first-party code
      // This includes main-app.js, page.js, layout.js and other bundles
      config.optimization = {
        ...config.optimization,
        // Keep module IDs readable for better debugging
        moduleIds: 'named',
      };
    }

    return config;
  },

  // Headers are now configured in vercel.json for better Vercel integration
}

module.exports = nextConfig
