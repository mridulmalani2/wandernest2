import { redis } from './redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

/**
 * Cache key validation error - thrown when an invalid key is used
 */
export class CacheKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheKeyError';
  }
}

/**
 * Maximum cache value size (1MB) to prevent Redis memory/OOM issues
 */
const MAX_CACHE_VALUE_SIZE = 1024 * 1024;

/**
 * Generic cache wrapper with Redis fallback to in-memory
 *
 * SECURITY: All operations validate key namespaces and reject unauthorized keys
 */
class CacheManager {
  private memoryCache: Map<string, { value: unknown; expires: number }> = new Map();
  private isRedisAvailable: boolean | null = null;
  private lastRedisCheck: number = 0;
  private readonly REDIS_CHECK_TTL = 60000; // 60 seconds

  // In-flight request tracking to prevent thundering herd
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  private readonly ALLOWED_PREFIXES = [
    'student:', 'tourist:', 'request:', 'match:',
    'dashboard:', 'students:', 'analytics:', 'verification:'
  ];

  /**
   * Validate key namespace to prevent collisions and unauthorized access
   * SECURITY: Always enforces in ALL environments - deny by default
   *
   * @throws CacheKeyError if key doesn't match allowed prefixes
   */
  private validateKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new CacheKeyError('Cache key must be a non-empty string');
    }

    // Validate length to prevent oversized keys
    if (key.length > 256) {
      throw new CacheKeyError('Cache key exceeds maximum length of 256 characters');
    }

    // Check for null bytes or control characters (injection prevention)
    if (/[\x00-\x1f]/.test(key)) {
      throw new CacheKeyError('Cache key contains invalid control characters');
    }

    if (!this.ALLOWED_PREFIXES.some(prefix => key.startsWith(prefix))) {
      // SECURITY: Do NOT log the key value to prevent PII leakage
      throw new CacheKeyError(
        `Cache key does not start with a valid prefix. Allowed: ${this.ALLOWED_PREFIXES.join(', ')}`
      );
    }
  }

  /**
   * Validate pattern for deletePattern operations
   * SECURITY: Ensures patterns can only delete within allowed namespaces
   *
   * @throws CacheKeyError if pattern could match outside allowed namespaces
   */
  private validatePattern(pattern: string): void {
    if (!pattern || typeof pattern !== 'string') {
      throw new CacheKeyError('Cache pattern must be a non-empty string');
    }

    // Reject overly broad patterns that could affect the entire cache
    if (pattern === '*' || pattern === '**' || pattern.startsWith('*')) {
      throw new CacheKeyError('Pattern must start with a specific namespace prefix, not a wildcard');
    }

    // Validate length
    if (pattern.length > 256) {
      throw new CacheKeyError('Cache pattern exceeds maximum length of 256 characters');
    }

    // Check for null bytes or control characters
    if (/[\x00-\x1f]/.test(pattern)) {
      throw new CacheKeyError('Cache pattern contains invalid control characters');
    }

    // Ensure pattern starts with an allowed prefix
    const patternBase = pattern.split('*')[0]; // Get the part before first wildcard
    if (!this.ALLOWED_PREFIXES.some(prefix => patternBase.startsWith(prefix))) {
      throw new CacheKeyError(
        `Cache pattern must start with an allowed prefix. Allowed: ${this.ALLOWED_PREFIXES.join(', ')}`
      );
    }
  }

  /**
   * Check if Redis is available (public for invalidation helpers)
   */
  public async checkRedis(): Promise<boolean> {
    const now = Date.now();
    // Use cached status if within TTL
    if (this.isRedisAvailable !== null && (now - this.lastRedisCheck < this.REDIS_CHECK_TTL)) {
      return this.isRedisAvailable;
    }

    if (!redis) {
      this.isRedisAvailable = false;
      this.lastRedisCheck = now;
      return false;
    }

    try {
      await redis.ping();
      this.isRedisAvailable = true;
      this.lastRedisCheck = now;
      return true;
    } catch {
      // Only log initial failure or state change to reduce noise
      if (this.isRedisAvailable !== false) {
        console.warn('[Cache] Redis not available, falling back to in-memory cache');
      }
      this.isRedisAvailable = false;
      this.lastRedisCheck = now;
      return false;
    }
  }

  /**
   * Get value from cache with safe JSON parsing
   *
   * SECURITY: Validates key namespace before any operation
   * NOTE: Returns undefined for cache miss, null is a valid cached value
   */
  async get<T>(key: string): Promise<T | undefined> {
    this.validateKey(key);
    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable && redis) {
      try {
        const value = await redis.get(key);
        if (value === null) {
          // Key not found in Redis
          return undefined;
        }

        // Safe JSON parsing with validation
        try {
          const parsed = JSON.parse(value);
          // Parsed successfully - return value (including null, which is valid)
          return parsed as T;
        } catch {
          // Corrupted entry - delete it silently
          // SECURITY: Don't log the key to prevent PII exposure
          await redis.del(key);
          return undefined;
        }
      } catch {
        // Redis error - mark as unavailable and fallback
        this.isRedisAvailable = false;
      }
    }

    // Fallback to in-memory cache
    const cached = this.memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value as T;
    }

    // Clean up expired entry
    if (cached) {
      this.memoryCache.delete(key);
    }

    return undefined;
  }

  /**
   * Set value in cache
   *
   * SECURITY: Validates key namespace and value size before storing
   */
  async set(key: string, value: unknown, options: CacheOptions = {}): Promise<void> {
    this.validateKey(key);
    const { ttl = 300 } = options; // Default 5 minutes

    // SECURITY: Serialize first to check size and catch errors early
    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch (err) {
      // Catch circular reference or other serialization errors
      // Don't conflate with Redis availability
      throw new Error(
        `Failed to serialize cache value: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }

    // SECURITY: Enforce size limit to prevent Redis OOM
    if (serialized.length > MAX_CACHE_VALUE_SIZE) {
      throw new Error(
        `Cache value exceeds maximum size of ${MAX_CACHE_VALUE_SIZE} bytes`
      );
    }

    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable && redis) {
      try {
        await redis.setex(key, ttl, serialized);
        return;
      } catch {
        // Redis error - mark as unavailable and fallback
        this.isRedisAvailable = false;
      }
    }

    // Fallback to in-memory cache
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });

    // Clean up old entries periodically (simple strategy)
    if (this.memoryCache.size > 1000) {
      const now = Date.now();
      const entries = Array.from(this.memoryCache.entries());
      for (const [k, v] of entries) {
        if (v.expires < now) {
          this.memoryCache.delete(k);
        }
      }
    }
  }

  /**
   * Delete value from cache
   *
   * SECURITY: Validates key namespace before deletion
   */
  async delete(key: string): Promise<void> {
    this.validateKey(key);
    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable && redis) {
      try {
        await redis.del(key);
      } catch {
        this.isRedisAvailable = false;
      }
    }

    this.memoryCache.delete(key);
  }

  /**
   * Delete multiple keys matching a pattern
   *
   * SECURITY: Validates pattern to prevent unauthorized namespace access
   */
  async deletePattern(pattern: string): Promise<void> {
    // SECURITY: Validate pattern before any operation
    this.validatePattern(pattern);

    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable && redis) {
      try {
        // SECURITY: Use SCAN instead of KEYS to avoid blocking Redis (DoS prevention)
        let cursor = '0';
        do {
          const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = result[0];
          const keys = result[1];

          if (keys.length > 0) {
            await redis.del(...keys);
          }
        } while (cursor !== '0');
      } catch {
        this.isRedisAvailable = false;
      }
    }

    // For in-memory cache, delete matching keys
    // Convert glob pattern to regex, handling *, ?, and [...]
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*/g, '.*')  // * becomes .*
      .replace(/\?/g, '.');  // ? becomes single char match

    const regex = new RegExp(`^${regexPattern}$`);

    // Collect keys first to avoid mutation during iteration
    const keys = Array.from(this.memoryCache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Wrapper for cached function execution with request deduplication
   *
   * SECURITY: Prevents thundering herd problem by deduplicating concurrent requests
   * NOTE: Uses undefined as cache miss indicator - null is a valid cached value
   */
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Check cache first
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // SECURITY: Request deduplication to prevent thundering herd
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Execute the function and cache the result
    const promise = (async () => {
      try {
        const result = await fn();
        await this.set(key, result, options);
        return result;
      } finally {
        // Clean up pending request tracker
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear all in-memory cache (Redis keys remain unless explicitly deleted)
   */
  clearMemory(): void {
    this.memoryCache.clear();
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Helper function for caching with a key generator
 *
 * SECURITY: Validates generated key before use
 */
export async function withCache<T>(
  keyParts: (string | number)[],
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Validate key parts to prevent injection
  for (const part of keyParts) {
    if (typeof part === 'string' && /[\x00-\x1f:]/.test(part)) {
      throw new CacheKeyError('Key parts contain invalid characters');
    }
  }
  const key = keyParts.join(':');
  return cache.cached(key, fn, options);
}

/**
 * Cache invalidation helpers
 *
 * SECURITY: All helpers use validated patterns that start with allowed prefixes
 */
export const cacheInvalidation = {
  /**
   * Invalidate all student-related caches
   */
  async student(studentId: string): Promise<void> {
    if (!studentId || typeof studentId !== 'string') {
      throw new CacheKeyError('Invalid student ID for cache invalidation');
    }
    // Sanitize studentId to prevent pattern injection
    const safeId = studentId.replace(/[*?\[\]]/g, '');
    await cache.deletePattern(`student:${safeId}:*`);
    await cache.deletePattern(`dashboard:student:${safeId}`);
    await cache.deletePattern(`students:approved:*`); // City lists may be affected
  },

  /**
   * Invalidate all tourist-related caches
   */
  async tourist(touristId: string): Promise<void> {
    if (!touristId || typeof touristId !== 'string') {
      throw new CacheKeyError('Invalid tourist ID for cache invalidation');
    }
    const safeId = touristId.replace(/[*?\[\]]/g, '');
    await cache.deletePattern(`tourist:${safeId}:*`);
  },

  /**
   * Invalidate request-related caches
   */
  async request(requestId: string): Promise<void> {
    if (!requestId || typeof requestId !== 'string') {
      throw new CacheKeyError('Invalid request ID for cache invalidation');
    }
    const safeId = requestId.replace(/[*?\[\]]/g, '');
    await cache.deletePattern(`match:${safeId}*`);
    await cache.deletePattern(`request:${safeId}:*`);
  },

  /**
   * Invalidate analytics caches
   */
  async analytics(): Promise<void> {
    await cache.deletePattern('analytics:*');
  },

  /**
   * Invalidate city-specific caches
   */
  async city(city: string): Promise<void> {
    if (!city || typeof city !== 'string') {
      throw new CacheKeyError('Invalid city for cache invalidation');
    }
    // Sanitize city to prevent pattern injection
    const safeCity = city.replace(/[*?\[\]]/g, '');
    await cache.deletePattern(`students:approved:${safeCity}*`);
    await cache.deletePattern(`analytics:city:${safeCity}*`);
  },

  /**
   * Invalidate all caches (use sparingly)
   *
   * SECURITY: This operation is protected to prevent accidental data loss.
   * In production, it only clears the memory cache unless explicitly confirmed.
   *
   * @param confirm - Must be true to flush Redis in production
   */
  async all(confirm: boolean = false): Promise<void> {
    cache.clearMemory();

    const isProduction = process.env.NODE_ENV === 'production';

    // In production, require explicit confirmation to flush Redis
    if (isProduction && !confirm) {
      console.warn(
        '[Cache] Redis flush blocked in production. Pass confirm=true to proceed.'
      );
      return;
    }

    const isRedisAvailable = await cache.checkRedis();
    if (isRedisAvailable && redis) {
      try {
        await redis.flushdb();
        console.log('[Cache] Redis cache flushed');
      } catch {
        // Log without exposing details
        console.error('[Cache] Redis flushdb failed');
      }
    }
  },
};
