import { redis } from './redis';

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

  /**
   * Check if Redis is available
   */
  private async checkRedis(): Promise<boolean> {
    if (this.isRedisAvailable !== null) {
      return this.isRedisAvailable;
    }

    try {
      await redis.ping();
      this.isRedisAvailable = true;
      return true;
    } catch (error) {
      console.warn('Redis not available, falling back to in-memory cache');
      this.isRedisAvailable = false;
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable) {
      try {
        const value = await redis.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
      } catch (error) {
        console.error(`Redis get error for key ${key}:`, error);
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
    const { ttl = 300 } = options; // Default 5 minutes
    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable) {
      try {
        await redis.setex(key, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        console.error(`Redis set error for key ${key}:`, error);
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
    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable) {
      try {
        await redis.del(key);
      } catch (error) {
        console.error(`Redis delete error for key ${key}:`, error);
      }
    }

    this.memoryCache.delete(key);
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    const isRedisAvailable = await this.checkRedis();

    if (isRedisAvailable) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.error(`Redis deletePattern error for pattern ${pattern}:`, error);
      }
    }

    // For in-memory cache, delete matching keys
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
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
   */
  async all(): Promise<void> {
    cache.clearMemory();
    const isRedisAvailable = await cache['checkRedis']();
    if (isRedisAvailable) {
      try {
        await redis.flushdb();
      } catch (error) {
        console.error('Redis flushdb error:', error);
      }
    }
  },
};
