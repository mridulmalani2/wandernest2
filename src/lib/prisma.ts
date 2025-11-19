import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized for Vercel serverless functions with connection pooling
// Use connection limit in DATABASE_URL: ?connection_limit=5&pool_timeout=10&connect_timeout=10
//
// IMPORTANT: DATABASE_URL is optional for preview deployments
// This allows frontend-only changes to deploy without database access
const isDatabaseAvailable = process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('dummy');

export const prisma = isDatabaseAvailable
  ? (globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }))
  : null as any; // Null for preview deployments without database

// Ensure singleton in all environments for connection reuse
if (isDatabaseAvailable && prisma) {
  globalForPrisma.prisma = prisma
}
