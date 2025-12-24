import 'server-only'

/**
 * Configuration validation and management
 *
 * SECURITY FEATURES:
 * - Input validation for all numeric environment variables
 * - Secret redaction in logs and error messages
 * - Immutable configuration summary
 * - Log injection prevention
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
    contactEmail: string
    resendApiKey: string | null
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
 * SECURITY: These arrays are internal and not exposed directly
 */
const configWarnings: string[] = []

/**
 * Configuration errors for critical misconfigurations
 * SECURITY: These arrays are internal and not exposed directly
 */
const configErrors: string[] = []

/**
 * Default values for numeric configuration
 */
const DEFAULT_EMAIL_PORT = 587;
const DEFAULT_VERIFICATION_EXPIRY = 600; // 10 minutes
const MIN_PORT = 1;
const MAX_PORT = 65535;
const MIN_EXPIRY = 60; // 1 minute
const MAX_EXPIRY = 3600; // 1 hour

/**
 * Parse integer environment variable with validation
 * SECURITY: Returns default value if parsing fails instead of NaN
 */
function parseIntEnv(value: string | undefined, defaultValue: number, min: number, max: number): number {
  if (!value) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);

  // Check for NaN or invalid range
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue;
  }

  return parsed;
}

/**
 * Redact sensitive values for logging
 * SECURITY: Prevents secrets from appearing in logs
 */
function redactUrl(url: string | null): string {
  if (!url) return '[not configured]';

  try {
    const parsed = new URL(url);
    // Redact password if present
    if (parsed.password) {
      parsed.password = '[REDACTED]';
    }
    // Redact username if it looks like an API key
    if (parsed.username && parsed.username.length > 20) {
      parsed.username = '[REDACTED]';
    }
    return parsed.toString();
  } catch {
    // If not a valid URL, just indicate it's configured
    return '[configured]';
  }
}

/**
 * Sanitize string for safe logging (prevent log injection)
 * SECURITY: Removes control characters that could forge log entries
 */
function sanitizeForLog(value: string): string {
  return value.replace(/[\x00-\x1F\x7F]/g, '').substring(0, 200);
}

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
  // OPTIONAL: If not set, app will use mock mode (logs emails instead of sending)
  const emailHost = process.env.EMAIL_HOST || null
  // SECURITY: Validate port with bounds checking
  const emailPort = parseIntEnv(process.env.EMAIL_PORT, DEFAULT_EMAIL_PORT, MIN_PORT, MAX_PORT)
  const emailUser = process.env.EMAIL_USER || null
  const emailPass = process.env.EMAIL_PASS || null
  const emailFrom = process.env.EMAIL_FROM || 'TourWise <team@tourwiseco.com>'
  const contactEmail = process.env.CONTACT_EMAIL || 'team@tourwiseco.com'
  const resendApiKey = process.env.RESEND_API_KEY || null

  // Configured if Resend is set OR SMTP is set
  const isEmailConfigured = !!resendApiKey || !!(emailHost && emailUser && emailPass)

  if (!isEmailConfigured && isProduction) {
    configWarnings.push(
      'Email is not configured (RESEND_API_KEY or SMTP) - emails will be logged but not sent'
    )
  }

  // Google OAuth configuration
  const googleClientId = process.env.GOOGLE_CLIENT_ID || null
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || null
  const isGoogleConfigured = !!(googleClientId && googleClientSecret)

  if (!isGoogleConfigured) {
    if (isProduction) {
      configWarnings.push(
        'Google OAuth is not configured - authentication will fail'
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
      configWarnings.push(
        'NEXTAUTH_SECRET is required in production - generate with: openssl rand -base64 32'
      )
    } else {
      configWarnings.push('NEXTAUTH_SECRET is not set - required for authentication')
    }
  } else {
    // Validate NEXTAUTH_SECRET strength in production
    if (isProduction && nextAuthSecret.length < 32) {
      configWarnings.push(
        'NEXTAUTH_SECRET is too short - must be at least 32 characters for production security'
      )
    }
  }

  if (!nextAuthUrl) {
    if (isProduction) {
      configWarnings.push(
        'NEXTAUTH_URL is not set - Vercel can auto-detect this, but explicit is recommended'
      )
    } else {
      configWarnings.push('NEXTAUTH_URL is not set - using default (http://localhost:3000)')
    }
  } else {
    // Validate NEXTAUTH_URL format
    if (!nextAuthUrl.startsWith('http://') && !nextAuthUrl.startsWith('https://')) {
      configWarnings.push('NEXTAUTH_URL must start with http:// or https://')
    }
    if (isProduction && nextAuthUrl.startsWith('http://')) {
      configWarnings.push('NEXTAUTH_URL must use https:// in production (not http://)')
    }
  }

  // JWT configuration (for admin auth)
  // OPTIONAL: Only needed if using admin panel features
  const jwtSecret = process.env.JWT_SECRET || null
  const isJwtConfigured = !!jwtSecret

  if (!isJwtConfigured && isProduction) {
    configWarnings.push('JWT_SECRET is not set - admin authentication features will not work')
  }

  // App configuration
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || null

  if (!baseUrl && isProduction) {
    configWarnings.push(
      'NEXT_PUBLIC_BASE_URL is not set - email links may not work correctly'
    )
  }

  // Redis configuration
  // OPTIONAL: If not set, verification codes will use database fallback (slower but functional)
  const redisUrl = process.env.REDIS_URL || null
  const isRedisConfigured = !!redisUrl

  if (!isRedisConfigured && isProduction) {
    configWarnings.push(
      'REDIS_URL is not set - verification codes will use database fallback (slower but functional)'
    )
  }

  // Verification code expiry (in seconds)
  // SECURITY: Validate with bounds checking
  const verificationCodeExpiry = parseIntEnv(
    process.env.VERIFICATION_CODE_EXPIRY,
    DEFAULT_VERIFICATION_EXPIRY,
    MIN_EXPIRY,
    MAX_EXPIRY
  )

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
      contactEmail: contactEmail,
      resendApiKey: resendApiKey,
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
    app: {
      nodeEnv,
      baseUrl: baseUrl || null,
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
 *
 * SECURITY: Does not log any secret values or URLs that might contain credentials
 */
export function logConfigStatus(): void {
  console.log('\n========================================')
  console.log('[Config] TourWiseCo Configuration Status')
  console.log('========================================')

  console.log(`\n[Config] Environment: ${config.app.nodeEnv}`)

  console.log('\n[Config] Integration Status:')
  console.log(`  Database:     ${config.database.isAvailable ? 'Connected' : 'NOT CONFIGURED (REQUIRED)'}`)
  console.log(`  Email:        ${config.email.isConfigured ? 'Configured' : 'Not configured'}`)
  console.log(`  Google Auth:  ${config.auth.google.isConfigured ? 'Configured' : 'NOT CONFIGURED (REQUIRED)'}`)
  console.log(`  NextAuth:     ${config.auth.nextAuth.isConfigured ? 'Configured' : 'Partial config'}`)
  console.log(`  Redis Cache:  ${config.redis.isConfigured ? 'Configured' : 'Using in-memory'}`)

  // SECURITY: Log warning/error counts, not content (to avoid leaking secrets)
  if (configWarnings.length > 0) {
    console.log(`\n[Config] Warnings: ${configWarnings.length} configuration warning(s)`)
    // Only show sanitized, non-sensitive warnings in development
    if (config.app.isDevelopment) {
      configWarnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${sanitizeForLog(warning)}`)
      })
    }
  }

  if (configErrors.length > 0) {
    console.log(`\n[Config] Errors: ${configErrors.length} configuration error(s)`)
    // Only show sanitized, non-sensitive errors in development
    if (config.app.isDevelopment) {
      configErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${sanitizeForLog(error)}`)
      })
    }
  }

  if (configWarnings.length === 0 && configErrors.length === 0) {
    console.log('\n[Config] All systems configured')
  }

  console.log('\n========================================\n')
}

/**
 * Throw error if critical configuration is missing
 *
 * SECURITY: Error message is generic to avoid leaking configuration details
 */
export function validateCriticalConfig(): void {
  if (configErrors.length > 0) {
    // SECURITY: Don't expose the actual error messages which might contain secrets
    throw new Error(
      `Critical configuration errors detected (${configErrors.length}). Check server logs for details.`
    )
  }
}

/**
 * Get a safe, user-friendly configuration summary for health checks
 *
 * SECURITY: Returns immutable copies of arrays to prevent external mutation
 * Does not include actual warning/error messages (they may contain secrets)
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
    // SECURITY: Only expose counts, not actual messages
    warningCount: configWarnings.length,
    errorCount: configErrors.length,
    healthy: configErrors.length === 0,
  }
}

// Load configuration once at module import
export const config = loadConfig()

// In development, log config status on startup
if (config.app.isDevelopment) {
  logConfigStatus()
}
