/**
 * Structured Logger
 *
 * Provides consistent, structured logging across the application.
 * In production, logs are minimized and formatted for log aggregation services.
 * In development, logs are verbose and colorful for debugging.
 *
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Structured context data
 * - Environment-aware formatting
 * - Sensitive data filtering
 * - Request correlation IDs
 *
 * @example
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: '123', method: 'oauth' });
 * logger.error('Database connection failed', { error: err.message });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

// Sensitive field names that should be redacted
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'sessionToken',
  'accessToken',
  'refreshToken',
  'verificationCode',
  'otp',
  'code',
  'creditCard',
  'ssn',
  'privateKey',
]);

/**
 * Redact sensitive values from log context
 */
function redactSensitive(obj: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 5) return '[MAX_DEPTH]';

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Truncate very long strings
    if (obj.length > 500) {
      return obj.substring(0, 500) + '...[truncated]';
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    // Limit array size in logs
    const limited = obj.slice(0, 10);
    const result = limited.map((item) => redactSensitive(item, depth + 1));
    if (obj.length > 10) {
      result.push(`...[${obj.length - 10} more items]`);
    }
    return result;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactSensitive(value, depth + 1);
      }
    }
    return result;
  }

  return obj;
}

/**
 * Format log entry for output
 */
function formatLog(entry: LogEntry): string {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify({
      ts: entry.timestamp,
      level: entry.level,
      msg: entry.message,
      ...entry.context,
    });
  }

  // Pretty format for development
  const colors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
  };
  const reset = '\x1b[0m';
  const dim = '\x1b[2m';

  const levelColor = colors[entry.level];
  const levelStr = entry.level.toUpperCase().padEnd(5);

  let output = `${dim}${entry.timestamp}${reset} ${levelColor}${levelStr}${reset} ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    const contextStr = JSON.stringify(entry.context, null, 2);
    output += `\n${dim}${contextStr}${reset}`;
  }

  return output;
}

/**
 * Determine if log should be output based on level
 */
function shouldLog(level: LogLevel): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const minLevel = levels.indexOf(logLevel as LogLevel);
  const currentLevel = levels.indexOf(level);

  return currentLevel >= minLevel;
}

/**
 * Create a log entry
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context) {
    entry.context = redactSensitive(context) as LogContext;
  }

  const formatted = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug level - verbose information for development
   */
  debug(message: string, context?: LogContext): void {
    log('debug', message, context);
  },

  /**
   * Info level - general operational information
   */
  info(message: string, context?: LogContext): void {
    log('info', message, context);
  },

  /**
   * Warn level - potentially problematic situations
   */
  warn(message: string, context?: LogContext): void {
    log('warn', message, context);
  },

  /**
   * Error level - errors that need attention
   */
  error(message: string, context?: LogContext): void {
    log('error', message, context);
  },

  /**
   * Create a child logger with preset context
   */
  child(baseContext: LogContext): typeof logger {
    return {
      debug: (msg: string, ctx?: LogContext) => log('debug', msg, { ...baseContext, ...ctx }),
      info: (msg: string, ctx?: LogContext) => log('info', msg, { ...baseContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => log('warn', msg, { ...baseContext, ...ctx }),
      error: (msg: string, ctx?: LogContext) => log('error', msg, { ...baseContext, ...ctx }),
      child: (additionalContext: LogContext) =>
        logger.child({ ...baseContext, ...additionalContext }),
    };
  },
};

/**
 * Create a request-scoped logger with correlation ID
 */
export function createRequestLogger(requestId: string, route: string) {
  return logger.child({ requestId, route });
}

export default logger;
