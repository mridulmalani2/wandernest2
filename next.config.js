const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Enable SWC-based minification (faster than Babel)
  swcMinify: true,

  // Production browser source maps disabled for smaller bundles
  productionBrowserSourceMaps: false,

  // Compiler optimizations for production
  compiler: {
    // Remove console logs in production (except errors and warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize package imports to reduce bundle size
  experimental: {
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
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // Webpack configuration for modern browsers and optimization
  webpack: (config, { dev, isServer }) => {
    // Target modern browsers with ES2020+ features (no legacy polyfills)
    config.target = isServer ? 'node18' : ['web', 'es2020'];

    // Production optimizations
    if (!dev) {
      // Enable source maps for production debugging
      config.devtool = 'source-map';

      // Enhanced tree shaking and dead code elimination
      config.optimization = {
        ...config.optimization,
        usedExports: true, // Tree shaking
        sideEffects: true, // Respect package.json sideEffects
        moduleIds: 'deterministic', // Better for long-term caching

        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Split vendor code into separate chunk
            default: false,
            vendors: false,
            // Framework chunk (React, Next.js)
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Common libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `lib.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Commons chunk for shared code
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      };
    }

    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)
