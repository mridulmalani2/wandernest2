import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized for Vercel serverless functions with connection pooling
// Use connection limit in DATABASE_URL: ?connection_limit=5&pool_timeout=10&connect_timeout=10
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Ensure singleton in all environments for connection reuse
globalForPrisma.prisma = prisma
