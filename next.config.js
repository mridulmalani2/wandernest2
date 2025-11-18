/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel serverless functions
  output: 'standalone',

  // Disable image optimization for simpler deployment (can enable later with proper domain config)
  images: {
    unoptimized: true,
  },

  // Configure headers for better security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
