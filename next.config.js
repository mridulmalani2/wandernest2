const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Security: Remove X-Powered-By header
  poweredByHeader: false,

  // Production browser source maps disabled for smaller bundles
  productionBrowserSourceMaps: false,

  // Compiler optimizations for production
  compiler: {
    // Remove console logs in production (except errors and warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // REMOVED: Experimental flags can be unstable in production
  // The experimental.optimizePackageImports and experimental.optimizeCss flags
  // have been removed for production stability. The modularizeImports config
  // below provides stable tree-shaking for lucide-react.
  // If you need these optimizations later, re-enable after testing thoroughly.

  // Modularize imports to reduce initial bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // Headers are configured in vercel.json for better Vercel integration
}

module.exports = withBundleAnalyzer(nextConfig)
