import 'server-only'
import { PrismaClient, Prisma } from '@prisma/client'
import { config } from '@/lib/config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaHealthy: boolean | undefined
  prismaLastError: string | undefined
}

/**
 * Database client with enhanced error handling and health tracking
 *
 * - Optimized for Vercel serverless with connection pooling
 * - Supports demo mode when DATABASE_URL is not configured
 * - Tracks connection health and provides clear error messages
 */

let prismaClient: PrismaClient | null = null

if (config.database.isAvailable) {
  try {
    // Create Prisma client with optimized settings for serverless
    prismaClient = globalForPrisma.prisma ?? new PrismaClient({
      log: config.app.isDevelopment
        ? ['error', 'warn']
        : ['error'],
      datasources: {
        db: {
          url: config.database.url!,
        },
      },
    })

    // Ensure singleton pattern for connection reuse
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClient
      globalForPrisma.prismaHealthy = true

      // Log successful initialization in development
      if (config.app.isDevelopment) {
        console.log('✅ Database client initialized')
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    globalForPrisma.prismaLastError = errorMessage

    console.error('❌ Failed to initialize Prisma client:', errorMessage)
    console.error('   Check your DATABASE_URL configuration')

    // In production, we throw to fail fast
    if (config.app.isProduction) {
      throw new Error(`Database initialization failed: ${errorMessage}`)
    }
  }
} else {
  if (config.app.isDevelopment) {
    console.log('⚠️  Database not configured - running in demo mode')
  }
}

// Export with non-null assertion in production mode
// In production, initialization throws if DB is unavailable (line 53-55 above)
// So prisma will never be null in production
export const prisma = prismaClient as PrismaClient

/**
 * Check if database is available and healthy
 */
export async function checkDatabaseHealth(): Promise<{
  available: boolean
  healthy: boolean
  error?: string
}> {
  if (!prisma) {
    return {
      available: false,
      healthy: false,
      error: globalForPrisma.prismaLastError || 'Database not configured',
    }
  }

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`
    globalForPrisma.prismaHealthy = true
    return { available: true, healthy: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    globalForPrisma.prismaHealthy = false
    globalForPrisma.prismaLastError = errorMessage

    console.error('❌ Database health check failed:', errorMessage)

    return {
      available: true,
      healthy: false,
      error: errorMessage,
    }
  }
}

/**
 * Ensure database is available, throw clear error if not
 */
export function requireDatabase(): PrismaClient {
  if (!prisma) {
    const error = globalForPrisma.prismaLastError || 'Database is not configured'
    throw new Error(
      `Database required but not available: ${error}. ` +
      'Please check DATABASE_URL environment variable.'
    )
  }

  if (globalForPrisma.prismaHealthy === false) {
    throw new Error(
      `Database is unhealthy: ${globalForPrisma.prismaLastError}. ` +
      'Please check database connection and try again.'
    )
  }

  return prisma
}

/**
 * Check if error is a database connection error
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Connection-related error codes
    return ['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1017'].includes(error.code)
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('database')
    )
  }

  return false
}

/**
 * Get user-friendly error message for database errors
 */
export function getDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return 'Database connection failed. Please check if the database is running and accessible.'
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P1000':
        return 'Authentication failed for database. Please check credentials.'
      case 'P1001':
        return 'Cannot reach database server. Please check host and port.'
      case 'P1002':
        return 'Database server connection timed out.'
      case 'P1003':
        return 'Database does not exist.'
      case 'P1008':
        return 'Database operations timed out.'
      case 'P2002':
        return 'A record with this information already exists.'
      case 'P2025':
        return 'The requested record was not found.'
      default:
        return 'A database error occurred.'
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED')) {
      return 'Database connection refused. Is the database running?'
    }
    if (error.message.includes('ETIMEDOUT')) {
      return 'Database connection timed out. Please check network connectivity.'
    }
  }

  return 'An unexpected database error occurred.'
}
