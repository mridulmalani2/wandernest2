import { getConnectedRedisClient } from './redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

/**
 * Generic cache wrapper with Redis fallback to in-memory
 */
class CacheManager {
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private isRedisAvailable: boolean | null = null;
  private lastRedisCheck: number = 0;
  private readonly REDIS_CHECK_TTL = 60000; // 60 seconds

  private readonly ALLOWED_PREFIXES = [
    'student:', 'tourist:', 'request:', 'match:', 'matches:',
    'dashboard:', 'students:', 'analytics:', 'verification:'
  ];

  /**
   * Validate key namespace to prevent collisions and insecure usage
   */
  private validateKey(key: string): void {
    if (!this.ALLOWED_PREFIXES.some(prefix => key.startsWith(prefix))) {
      // In development warn, in production could throw or log
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Cache] Warning: Key "${key}" does not start with a valid prefix`);
      }
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

    const client = await getConnectedRedisClient();
    if (!client) {
      this.isRedisAvailable = false;
      this.lastRedisCheck = now;
      return false;
    }

    try {
      await client.ping();
      this.isRedisAvailable = true;
      this.lastRedisCheck = now;
      return true;
    } catch (error) {
      // Only log initial failure or state change to reduce noise
      if (this.isRedisAvailable !== false) {
        console.warn('Redis not available, falling back to in-memory cache');
      }
      this.isRedisAvailable = false;
      this.lastRedisCheck = now;
      return false;
    }
  }

  /**
   * Get value from cache with safe JSON parsing
   */
  async get<T>(key: string): Promise<T | null> {
    this.validateKey(key);
    const isRedisAvailable = await this.checkRedis();

    const client = isRedisAvailable ? await getConnectedRedisClient() : null;
    if (client) {
      try {
        const value = await client.get(key);
        if (value) {
          // Safe JSON parsing with validation
          try {
            const parsed = JSON.parse(value);
            // Basic type validation - ensure we got an object or array
            if (parsed === null || (typeof parsed !== 'object' && typeof parsed !== 'boolean' && typeof parsed !== 'number' && typeof parsed !== 'string')) {
              console.warn(`[Cache] Invalid cached value type for key: ${key}`);
              // Delete invalid entry
              await client.del(key);
              return null;
            }
            return parsed as T;
          } catch (parseError) {
            console.error(`[Cache] JSON parse error for key ${key}:`, parseError instanceof Error ? parseError.message : 'Unknown');
            // Delete corrupted entry
            await client.del(key);
            return null;
          }
        }
      } catch (error) {
        console.error('Redis get error', error instanceof Error ? error.message : 'Unknown');
        // Mark as unavailable to trigger immediate fallback and re-check logic next time (after TTL expires)
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

    return null;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    this.validateKey(key);
    const { ttl = 300 } = options; // Default 5 minutes
    const isRedisAvailable = await this.checkRedis();

    const client = isRedisAvailable ? await getConnectedRedisClient() : null;
    if (client) {
      try {
        await client.setex(key, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        console.error('Redis set error', error instanceof Error ? error.message : 'Unknown');
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
   */
  async delete(key: string): Promise<void> {
    this.validateKey(key);
    const isRedisAvailable = await this.checkRedis();

    const client = isRedisAvailable ? await getConnectedRedisClient() : null;
    if (client) {
      try {
        await client.del(key);
      } catch (error) {
        console.error('Redis delete error', error instanceof Error ? error.message : 'Unknown');
        this.isRedisAvailable = false;
      }
    }

    this.memoryCache.delete(key);
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    // Pattern validation
    if (pattern.includes('**')) {
      console.warn('Recursive patterns not supported safely');
      return;
    }
    const isRedisAvailable = await this.checkRedis();

    const client = isRedisAvailable ? await getConnectedRedisClient() : null;
    if (client) {
      try {
        // SECURITY: Use SCAN instead of KEYS to avoid blocking the Redis server (DoS prevention)
        // KEYS is O(N) and blocks, while SCAN is O(1) per iteration.
        // Manual scan loop for ioredis
        let cursor = '0';
        do {
          const result = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = result[0];
          const keys = result[1];

          if (keys.length > 0) {
            await client.del(...keys);
          }
        } while (cursor !== '0');


      } catch (error) {
        console.error('Redis deletePattern error', error instanceof Error ? error.message : 'Unknown');
        this.isRedisAvailable = false;
      }
    }

    // For in-memory cache, delete matching keys
    // Escape regex characters except * which becomes .*
    const safeRegexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*'); // Convert wildcard

    const regex = new RegExp(`^${safeRegexPattern}$`);

    // We can't iterate safely while deleting in some map implementations, 
    // so collect keys first
    const keys = Array.from(this.memoryCache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Wrapper for cached function execution
   */
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  /**
   * Clear all in-memory cache (Redis keys remain unless explicitly deleted)
   */
  clearMemory(): void {
    this.memoryCache.clear();
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Helper function for caching with a key generator
 */
export async function withCache<T>(
  keyParts: (string | number)[],
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const key = keyParts.join(':');
  return cache.cached(key, fn, options);
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  /**
   * Invalidate all student-related caches
   */
  async student(studentId: string): Promise<void> {
    await cache.deletePattern(`student:${studentId}:*`);
    await cache.deletePattern(`dashboard:student:${studentId}`);
    await cache.deletePattern(`students:approved:*`); // City lists may be affected
  },

  /**
   * Invalidate all tourist-related caches
   */
  async tourist(touristId: string): Promise<void> {
    await cache.deletePattern(`tourist:${touristId}:*`);
  },

  /**
   * Invalidate request-related caches
   */
  async request(requestId: string): Promise<void> {
    await cache.deletePattern(`matches:${requestId}*`);
    await cache.deletePattern(`request:${requestId}:*`);
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
    await cache.deletePattern(`students:approved:${city}*`);
    await cache.deletePattern(`analytics:city:${city}*`);
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
    const client = isRedisAvailable ? await getConnectedRedisClient() : null;
    if (client) {
      try {
        await client.flushdb();
        console.log('[Cache] Redis cache flushed');
      } catch (error) {
        console.error('Redis flushdb error:', error instanceof Error ? error.message : 'Unknown');
      }
    }
  },
};
