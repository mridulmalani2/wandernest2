/**
 * Structured Logger
 *
 * Provides consistent, structured logging across the application.
 * In production, logs are minimized and formatted for log aggregation services.
 * In development, logs are verbose and colorful for debugging.
 *
 * SECURITY FEATURES:
 * - Sensitive data redaction (passwords, tokens, keys)
 * - Message content redaction
 * - Prototype pollution prevention
 * - Circular reference handling
 * - LOG_LEVEL validation
 * - Safe JSON serialization
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

// Valid log levels for validation
const VALID_LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

// Sensitive field names that should be redacted (all lowercase for comparison)
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'sessiontoken',
  'accesstoken',
  'refreshtoken',
  'verificationcode',
  'otp',
  'code',
  'creditcard',
  'ssn',
  'privatekey',
  'private_key',
  'bearer',
  'auth',
  'credential',
  'credentials',
  'key',
  'pass',
]);

// Patterns that indicate sensitive content in string values
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /bearer\s+\S+/i,
  /authorization:\s*\S+/i,
];

/**
 * Safe prototype-safe keys for iteration
 * SECURITY: Prevents prototype pollution by using hasOwnProperty
 */
function safeKeys(obj: object): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Check if a value is a plain object (not Map, Set, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Redact sensitive values from strings
 * SECURITY: Catches sensitive data in message strings
 */
function redactString(str: string): string {
  let result = str;

  // Truncate very long strings
  if (result.length > 500) {
    result = result.substring(0, 500) + '...[truncated]';
  }

  // Redact patterns that look like sensitive data
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(result)) {
      result = result.replace(pattern, '[REDACTED]');
    }
  }

  return result;
}

/**
 * Redact sensitive values from log context
 *
 * SECURITY FEATURES:
 * - Case-insensitive field matching
 * - Prototype pollution prevention (uses Object.hasOwn, creates with null prototype)
 * - Handles Map, Set, Buffer, and other non-plain objects
 * - Circular reference detection
 * - Maximum depth limiting
 */
function redactSensitive(obj: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  // Prevent infinite recursion
  if (depth > 5) return '[MAX_DEPTH]';

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return redactString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  // Handle BigInt - convert to string (JSON.stringify can't handle BigInt)
  if (typeof obj === 'bigint') {
    return obj.toString() + 'n';
  }

  // Handle functions - just indicate type
  if (typeof obj === 'function') {
    return '[Function]';
  }

  // Handle symbol
  if (typeof obj === 'symbol') {
    return obj.toString();
  }

  // Handle object types
  if (typeof obj === 'object') {
    // Circular reference detection
    if (seen.has(obj)) {
      return '[Circular]';
    }
    seen.add(obj);

    // Handle Arrays
    if (Array.isArray(obj)) {
      const limited = obj.slice(0, 10);
      const result = limited.map((item) => redactSensitive(item, depth + 1, seen));
      if (obj.length > 10) {
        result.push(`...[${obj.length - 10} more items]`);
      }
      return result;
    }

    // Handle Date
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Handle Error objects
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: redactString(obj.message),
        stack: obj.stack ? '[stack omitted]' : undefined,
      };
    }

    // Handle Map
    if (obj instanceof Map) {
      const mapObj: Record<string, unknown> = {};
      let count = 0;
      for (const [key, value] of obj.entries()) {
        if (count >= 10) {
          mapObj['...'] = `[${obj.size - 10} more entries]`;
          break;
        }
        const keyStr = String(key);
        if (SENSITIVE_FIELDS.has(keyStr.toLowerCase())) {
          mapObj[keyStr] = '[REDACTED]';
        } else {
          mapObj[keyStr] = redactSensitive(value, depth + 1, seen);
        }
        count++;
      }
      return { '[Map]': mapObj };
    }

    // Handle Set
    if (obj instanceof Set) {
      const items: unknown[] = [];
      let count = 0;
      for (const value of obj.values()) {
        if (count >= 10) {
          items.push(`...[${obj.size - 10} more items]`);
          break;
        }
        items.push(redactSensitive(value, depth + 1, seen));
        count++;
      }
      return { '[Set]': items };
    }

    // Handle Buffer - don't log binary content
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) {
      return `[Buffer: ${obj.length} bytes]`;
    }

    // Handle ArrayBuffer and TypedArrays
    if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
      const length = obj instanceof ArrayBuffer ? obj.byteLength : (obj as ArrayBufferView).byteLength;
      return `[Binary: ${length} bytes]`;
    }

    // Handle plain objects (safe for JSON)
    if (isPlainObject(obj)) {
      // SECURITY: Create result with null prototype to prevent prototype pollution
      const result: Record<string, unknown> = Object.create(null);

      for (const key of safeKeys(obj)) {
        // SECURITY: Skip dangerous prototype keys
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue;
        }

        // SECURITY: Case-insensitive sensitive field check
        if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = redactSensitive(obj[key], depth + 1, seen);
        }
      }
      return result;
    }

    // Unknown object type - just indicate the type
    return `[Object: ${obj.constructor?.name || 'Unknown'}]`;
  }

  return obj;
}

/**
 * Safe JSON stringify that handles circular references and special types
 */
function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    // If stringify fails, return a safe fallback
    return '"[Serialization Error]"';
  }
}

/**
 * Format log entry for output
 *
 * SECURITY: All context is redacted before formatting
 */
function formatLog(entry: LogEntry): string {
  const isProduction = process.env.NODE_ENV === 'production';

  // Redact message content
  const safeMessage = redactString(entry.message);

  // Redact context if present
  const safeContext = entry.context ? redactSensitive(entry.context) : undefined;

  if (isProduction) {
    // JSON format for production (easier to parse by log aggregators)
    // SECURITY: Use fixed key names to prevent context from overwriting canonical fields
    const logObj: Record<string, unknown> = {
      ts: entry.timestamp,
      level: entry.level,
      msg: safeMessage,
    };

    // Add context under a nested key to prevent field collision
    if (safeContext && typeof safeContext === 'object') {
      logObj.ctx = safeContext;
    }

    return safeStringify(logObj);
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

  let output = `${dim}${entry.timestamp}${reset} ${levelColor}${levelStr}${reset} ${safeMessage}`;

  if (safeContext && typeof safeContext === 'object' && Object.keys(safeContext).length > 0) {
    const contextStr = safeStringify(safeContext);
    // Pretty print in dev, but use safe stringify
    try {
      const pretty = JSON.stringify(JSON.parse(contextStr), null, 2);
      output += `\n${dim}${pretty}${reset}`;
    } catch {
      output += `\n${dim}${contextStr}${reset}`;
    }
  }

  return output;
}

/**
 * Determine if log should be output based on level
 *
 * SECURITY: Validates LOG_LEVEL environment variable
 * Invalid LOG_LEVEL defaults to 'info' in production, 'debug' in development
 */
function shouldLog(level: LogLevel): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  let logLevel = process.env.LOG_LEVEL?.toLowerCase() || (isProduction ? 'info' : 'debug');

  // SECURITY: Validate LOG_LEVEL is a known value
  if (!VALID_LOG_LEVELS.includes(logLevel as LogLevel)) {
    // Invalid LOG_LEVEL - use safe default (info) to avoid verbose logging in production
    logLevel = isProduction ? 'info' : 'debug';
  }

  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const minLevel = levels.indexOf(logLevel as LogLevel);
  const currentLevel = levels.indexOf(level);

  // Both should be valid at this point, but double-check
  if (minLevel === -1 || currentLevel === -1) {
    // Something went wrong - log it to be safe
    return true;
  }

  return currentLevel >= minLevel;
}

/**
 * Create a log entry
 *
 * SECURITY: Wraps all operations in try-catch to prevent logging failures from crashing the app
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  try {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      // Context will be redacted in formatLog
      entry.context = context;
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
  } catch {
    // SECURITY: If logging fails, try a minimal fallback
    try {
      console.error(`[Logger Error] Failed to log ${level}: ${message?.substring(0, 100)}`);
    } catch {
      // Complete failure - silently ignore to prevent crash
    }
  }
}

/**
 * Logger type definition
 */
export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(baseContext: LogContext): Logger;
}

/**
 * Logger implementation
 */
export const logger: Logger = {
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
  child(baseContext: LogContext): Logger {
    // SECURITY: Validate baseContext doesn't contain dangerous keys
    const safeBaseContext: LogContext = {};
    for (const key of Object.keys(baseContext)) {
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        safeBaseContext[key] = baseContext[key];
      }
    }

    return {
      debug: (msg: string, ctx?: LogContext) => log('debug', msg, { ...safeBaseContext, ...ctx }),
      info: (msg: string, ctx?: LogContext) => log('info', msg, { ...safeBaseContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => log('warn', msg, { ...safeBaseContext, ...ctx }),
      error: (msg: string, ctx?: LogContext) => log('error', msg, { ...safeBaseContext, ...ctx }),
      child: (additionalContext: LogContext) =>
        logger.child({ ...safeBaseContext, ...additionalContext }),
    };
  },
};

/**
 * Create a request-scoped logger with correlation ID
 *
 * SECURITY: Sanitizes requestId and route to prevent log injection
 */
export function createRequestLogger(requestId: string, route: string): Logger {
  // SECURITY: Sanitize inputs to prevent log injection
  // Remove newlines and control characters that could forge log entries
  const safeRequestId = typeof requestId === 'string'
    ? requestId.replace(/[\x00-\x1f\x7f]/g, '').substring(0, 64)
    : 'unknown';

  const safeRoute = typeof route === 'string'
    ? route.replace(/[\x00-\x1f\x7f]/g, '').substring(0, 256)
    : 'unknown';

  return logger.child({ requestId: safeRequestId, route: safeRoute });
}

export default logger;
