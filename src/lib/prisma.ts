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
 *
 * Serverless Optimizations:
 * - Uses global singleton to prevent creating multiple clients
 * - Connection pooling enabled via DATABASE_URL connection string
 * - Reduced log levels in production to minimize overhead
 * - Lazy connection initialization (connects on first query)
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
      // Serverless-specific optimizations
      errorFormat: config.app.isDevelopment ? 'pretty' : 'minimal',
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
    // Sanitize error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const minimalError = config.app.isProduction ? 'Database connection failed' : errorMessage

    globalForPrisma.prismaHealthy = false
    globalForPrisma.prismaLastError = minimalError

    // Secure logging
    if (config.app.isDevelopment) {
      console.error('❌ Database health check failed:', errorMessage)
    } else {
      console.error('❌ Database health check failed')
    }

    return {
      available: true,
      healthy: false,
      error: minimalError,
    }
  }
}

/**
 * Ensure database is available, throw clear error if not
 */
export function requireDatabase(): PrismaClient {
  if (!prisma) {
    const error = config.app.isDevelopment ? globalForPrisma.prismaLastError : 'Configuration missing';
    throw new Error(
      `Database required but not available. ${error}`
    )
  }

  if (globalForPrisma.prismaHealthy === false) {
    const error = config.app.isDevelopment ? globalForPrisma.prismaLastError : 'Connection failed';
    throw new Error(
      `Database is unhealthy. ${error}`
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
    const code = error.code;
    switch (code) {
      case 'P1000':
      case 'P1001':
      case 'P1002':
      case 'P1003':
      case 'P1008':
      case 'P1017': // Server closed connection
        return 'Database connection issue. Please try again.';
      case 'P2002':
        return 'A record with this information already exists.'
      case 'P2025':
        return 'The requested record was not found.'
      default:
        return 'A database error occurred.'
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('etimedout') ||
      message.includes('enotfound')
    ) {
      return 'Database connection unavailable. Please try again later.'
    }
  }

  return 'An unexpected database error occurred.'
}
