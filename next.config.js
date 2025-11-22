const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience and future-proofing
  reactStrictMode: true,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Enable SWC-based minification (faster than Babel)
  swcMinify: true,

  // Production browser source maps disabled for smaller bundles
  productionBrowserSourceMaps: false

  // Compiler optimizations for production
  compiler: {
    // Remove console logs in production (except errors and warnings)
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
      'react-hook-form',
      'zod',
    ],
    // Optimize CSS bundle size
    optimizeCss: true,
  },

  // Image optimization configuration
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
    deviceSizes: [640, 750, 1080, 1920], // Reduced from default 8 to 4
    imageSizes: [16, 32, 64, 96, 128, 256], // Reduced from default 8 to 6
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // Webpack configuration for modern output and optimizations
  webpack: (config, { dev, isServer }) => {
    // Target modern browsers with ES2020+ features
    config.target = isServer ? 'node16' : ['web', 'es2020'];

    // Configure source maps for production builds
    if (!dev) {
      // Enable source maps for production debugging
      config.devtool = 'source-map';

      // Enhanced optimization for production
      config.optimization = {
        ...config.optimization,
        // Keep module IDs readable for better debugging
        moduleIds: 'named',
        // Better tree shaking
        usedExports: true,
        // Split chunks more aggressively to improve caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks for better caching
            default: false,
            vendors: false,
            // Framework chunk (React, React-DOM, Next.js)
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Auth libraries (next-auth, bcryptjs, etc.)
            auth: {
              name: 'auth',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](next-auth|bcryptjs|jsonwebtoken)[\\/]/,
              priority: 35,
              enforce: true,
            },
            // UI libraries (Radix UI)
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 30,
              enforce: true,
            },
            // Icons and utilities
            lib: {
              name: 'lib',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lucide-react|clsx|tailwind-merge|class-variance-authority)[\\/]/,
              priority: 25,
              enforce: true,
            },
            // Common shared code
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      };
    }

    return config;
  },

  // Headers are configured in vercel.json for better Vercel integration
}

module.exports = withBundleAnalyzer(nextConfig)
