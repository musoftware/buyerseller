/**
 * Redis Cache Configuration
 * Provides caching layer for frequently accessed data
 */

import { Redis } from 'ioredis';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
        }
        return false;
    },
});

redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

export default redis;

/**
 * Cache key generators
 */
export const CacheKeys = {
    user: (id: string) => `user:${id}`,
    gig: (id: string) => `gig:${id}`,
    gigsByCategory: (category: string, page: number) => `gigs:category:${category}:page:${page}`,
    gigSearch: (query: string, page: number) => `gigs:search:${query}:page:${page}`,
    userGigs: (userId: string) => `user:${userId}:gigs`,
    userOrders: (userId: string) => `user:${userId}:orders`,
    conversation: (id: string) => `conversation:${id}`,
    notifications: (userId: string) => `notifications:${userId}`,
    analytics: (type: string, period: string) => `analytics:${type}:${period}`,
    session: (sessionId: string) => `session:${sessionId}`,
};

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
    WEEK: 604800, // 7 days
};

/**
 * Helper function to get cached data or fetch and cache
 */
export async function getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
): Promise<T> {
    try {
        // Try to get from cache
        const cached = await redis.get(key);

        if (cached) {
            return JSON.parse(cached) as T;
        }

        // Fetch fresh data
        const data = await fetcher();

        // Cache the result
        await redis.setex(key, ttl, JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Cache error:', error);
        // If cache fails, just fetch the data
        return fetcher();
    }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(keyOrPattern: string): Promise<void> {
    try {
        if (keyOrPattern.includes('*')) {
            // Pattern-based deletion
            const keys = await redis.keys(keyOrPattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } else {
            // Single key deletion
            await redis.del(keyOrPattern);
        }
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
}

/**
 * Set cache with custom TTL
 */
export async function setCache(
    key: string,
    value: any,
    ttl: number = CacheTTL.MEDIUM
): Promise<void> {
    try {
        await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

/**
 * Get cache value
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const cached = await redis.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

/**
 * Increment counter in cache
 */
export async function incrementCache(key: string, ttl?: number): Promise<number> {
    try {
        const value = await redis.incr(key);
        if (ttl) {
            await redis.expire(key, ttl);
        }
        return value;
    } catch (error) {
        console.error('Cache increment error:', error);
        return 0;
    }
}
