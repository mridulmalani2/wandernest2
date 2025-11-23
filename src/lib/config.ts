import 'server-only'

/**
 * Configuration validation and management
 *
 * This module validates all required environment variables at startup
 * and provides clear error messages when things are misconfigured.
 *
 * Usage:
 * import { config } from '@/lib/config'
 * const dbUrl = config.database.url
 */

export interface AppConfig {
  database: {
    url: string | null
    isAvailable: boolean
    isDummy: boolean
  }
  email: {
    host: string | null
    port: number
    user: string | null
    pass: string | null
    from: string
    isConfigured: boolean
  }
  auth: {
    google: {
      clientId: string | null
      clientSecret: string | null
      isConfigured: boolean
    }
    nextAuth: {
      secret: string | null
      url: string | null
      isConfigured: boolean
    }
    jwt: {
      secret: string | null
      isConfigured: boolean
    }
  }
  payment: {
    discoveryFee: number
  }
  app: {
    nodeEnv: string
    baseUrl: string | null
    isProduction: boolean
    isDevelopment: boolean
  }
  redis: {
    url: string | null
    isConfigured: boolean
  }
  verification: {
    codeExpiry: number  // Seconds until verification code expires
  }
}

/**
 * Configuration warnings for non-critical misconfigurations
 */
export const configWarnings: string[] = []

/**
 * Configuration errors for critical misconfigurations
 */
export const configErrors: string[] = []

/**
 * Validate and load application configuration
 */
function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'
  const isDevelopment = nodeEnv === 'development'

  // Database configuration
  const databaseUrl = process.env.DATABASE_URL || null
  const isDummyDatabase = databaseUrl?.includes('dummy') ?? false
  const isDatabaseAvailable = !!(databaseUrl && !isDummyDatabase)

  if (!databaseUrl) {
    configWarnings.push('DATABASE_URL is not set - running in demo mode')
  } else if (isDummyDatabase) {
    configWarnings.push('DATABASE_URL contains "dummy" - running in demo mode')
  } else {
    // Validate DATABASE_URL format
    try {
      new URL(databaseUrl)
    } catch {
      configErrors.push('DATABASE_URL is not a valid URL format')
    }
  }

  // Email configuration
  const emailHost = process.env.EMAIL_HOST || null
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10)
  const emailUser = process.env.EMAIL_USER || null
  const emailPass = process.env.EMAIL_PASS || null
  const emailFrom = process.env.EMAIL_FROM || 'TourWiseCo <noreply@tourwiseco.com>'
  const isEmailConfigured = !!(emailHost && emailUser && emailPass)

  if (!isEmailConfigured && isProduction) {
    configWarnings.push(
      'Email is not configured (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) - emails will not be sent'
    )
  }

  // Google OAuth configuration
  const googleClientId = process.env.GOOGLE_CLIENT_ID || null
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || null
  const isGoogleConfigured = !!(googleClientId && googleClientSecret)

  if (!isGoogleConfigured) {
    if (isProduction) {
      configErrors.push(
        'Google OAuth is not configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) - authentication will fail'
      )
    } else {
      configWarnings.push('Google OAuth is not fully configured - sign-in may not work')
    }
  }

  // NextAuth configuration
  const nextAuthSecret = process.env.NEXTAUTH_SECRET || null
  const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || null
  const isNextAuthConfigured = !!(nextAuthSecret && nextAuthUrl)

  if (!nextAuthSecret) {
    if (isProduction) {
      configErrors.push('NEXTAUTH_SECRET is required in production')
    } else {
      configWarnings.push('NEXTAUTH_SECRET is not set')
    }
  }

  if (!nextAuthUrl) {
    configWarnings.push('NEXTAUTH_URL is not set - using default')
  }

  // JWT configuration (for admin auth)
  const jwtSecret = process.env.JWT_SECRET || null
  const isJwtConfigured = !!jwtSecret

  if (!isJwtConfigured && isProduction) {
    configWarnings.push('JWT_SECRET is not set - admin authentication will not work')
  }

  // Payment configuration
  const discoveryFee = parseFloat(process.env.DISCOVERY_FEE_AMOUNT || '99.00')

  // App configuration
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || null

  if (!baseUrl && isProduction) {
    configWarnings.push(
      'NEXT_PUBLIC_BASE_URL is not set - email links may not work correctly'
    )
  }

  // Redis configuration (optional - used for caching and verification codes)
  const redisUrl = process.env.REDIS_URL || null
  const isRedisConfigured = !!redisUrl

  if (!isRedisConfigured && isProduction) {
    configWarnings.push(
      'REDIS_URL is not set - verification codes will use database fallback (slower but functional)'
    )
  }

  // Verification code expiry (in seconds)
  const verificationCodeExpiry = parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600', 10)

  return {
    database: {
      url: databaseUrl,
      isAvailable: isDatabaseAvailable,
      isDummy: isDummyDatabase,
    },
    email: {
      host: emailHost,
      port: emailPort,
      user: emailUser,
      pass: emailPass,
      from: emailFrom,
      isConfigured: isEmailConfigured,
    },
    auth: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        isConfigured: isGoogleConfigured,
      },
      nextAuth: {
        secret: nextAuthSecret,
        url: nextAuthUrl,
        isConfigured: isNextAuthConfigured,
      },
      jwt: {
        secret: jwtSecret,
        isConfigured: isJwtConfigured,
      },
    },
    payment: {
      discoveryFee,
    },
    app: {
      nodeEnv,
      baseUrl,
      isProduction,
      isDevelopment,
    },
    redis: {
      url: redisUrl,
      isConfigured: isRedisConfigured,
    },
    verification: {
      codeExpiry: verificationCodeExpiry,
    },
  }
}

/**
 * Log configuration status to console
 */
export function logConfigStatus(): void {
  console.log('\n========================================')
  console.log('🔧 WanderNest Configuration Status')
  console.log('========================================')

  console.log(`\n📊 Environment: ${config.app.nodeEnv}`)

  console.log('\n🔌 Integration Status:')
  console.log(`  Database:     ${config.database.isAvailable ? '✅ Connected' : '❌ NOT CONFIGURED (REQUIRED)'}`)
  console.log(`  Email:        ${config.email.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`  Google Auth:  ${config.auth.google.isConfigured ? '✅ Configured' : '❌ NOT CONFIGURED (REQUIRED)'}`)
  console.log(`  NextAuth:     ${config.auth.nextAuth.isConfigured ? '✅ Configured' : '⚠️  Partial config'}`)
  console.log(`  Redis Cache:  ${config.redis.isConfigured ? '✅ Configured' : '⚠️  Using in-memory'}`)

  if (configWarnings.length > 0) {
    console.log('\n⚠️  Configuration Warnings:')
    configWarnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`)
    })
  }

  if (configErrors.length > 0) {
    console.log('\n❌ Configuration Errors:')
    configErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`)
    })
  }

  if (configWarnings.length === 0 && configErrors.length === 0) {
    console.log('\n✅ All systems configured')
  }

  console.log('\n========================================\n')
}

/**
 * Throw error if critical configuration is missing
 */
export function validateCriticalConfig(): void {
  if (configErrors.length > 0) {
    throw new Error(
      `Critical configuration errors:\n${configErrors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`
    )
  }
}

/**
 * Get a safe, user-friendly configuration summary for health checks
 */
export function getConfigSummary() {
  return {
    environment: config.app.nodeEnv,
    integrations: {
      database: config.database.isAvailable ? 'connected' : 'unavailable',
      email: config.email.isConfigured ? 'configured' : 'not_configured',
      googleAuth: config.auth.google.isConfigured ? 'configured' : 'not_configured',
      redis: config.redis.isConfigured ? 'configured' : 'not_configured',
    },
    warnings: configWarnings.length,
    errors: configErrors.length,
    healthy: configErrors.length === 0,
  }
}

// Load configuration once at module import
export const config = loadConfig()

// In development, log config status on startup
if (config.app.isDevelopment) {
  logConfigStatus()
}
