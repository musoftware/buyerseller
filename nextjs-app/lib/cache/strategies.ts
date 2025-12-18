/**
 * Caching Strategies
 * Different caching patterns for various use cases
 */

import { getCached, invalidateCache, CacheKeys, CacheTTL } from './redis';

/**
 * Cache-Aside Pattern
 * Check cache first, if miss, fetch from DB and cache
 */
export async function cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
): Promise<T> {
    return getCached(key, fetcher, ttl);
}

/**
 * Write-Through Pattern
 * Write to cache and DB simultaneously
 */
export async function writeThrough<T>(
    key: string,
    data: T,
    dbWriter: () => Promise<void>,
    ttl: number = CacheTTL.MEDIUM
): Promise<void> {
    const { setCache } = await import('./redis');

    // Write to both cache and DB
    await Promise.all([
        setCache(key, data, ttl),
        dbWriter(),
    ]);
}

/**
 * Write-Behind Pattern
 * Write to cache immediately, DB asynchronously
 */
export async function writeBehind<T>(
    key: string,
    data: T,
    dbWriter: () => Promise<void>,
    ttl: number = CacheTTL.MEDIUM
): Promise<void> {
    const { setCache } = await import('./redis');

    // Write to cache immediately
    await setCache(key, data, ttl);

    // Write to DB asynchronously (don't await)
    dbWriter().catch(err => console.error('Write-behind DB error:', err));
}

/**
 * Refresh-Ahead Pattern
 * Refresh cache before it expires
 */
export async function refreshAhead<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM,
    refreshThreshold: number = 0.8 // Refresh when 80% of TTL has passed
): Promise<T> {
    const { getCache, setCache } = await import('./redis');
    const redis = (await import('./redis')).default;

    const cached = await getCache<T>(key);

    if (cached) {
        // Check TTL
        const remainingTTL = await redis.ttl(key);
        const shouldRefresh = remainingTTL < ttl * (1 - refreshThreshold);

        if (shouldRefresh) {
            // Refresh in background
            fetcher()
                .then(data => setCache(key, data, ttl))
                .catch(err => console.error('Refresh-ahead error:', err));
        }

        return cached;
    }

    // Cache miss, fetch and cache
    const data = await fetcher();
    await setCache(key, data, ttl);
    return data;
}

/**
 * Stale-While-Revalidate Pattern
 * Return stale data while fetching fresh data in background
 */
export async function staleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
): Promise<T> {
    const { getCache, setCache } = await import('./redis');
    const redis = (await import('./redis')).default;

    const cached = await getCache<T>(key);

    if (cached) {
        // Check if stale
        const remainingTTL = await redis.ttl(key);

        if (remainingTTL < 0) {
            // Stale, revalidate in background
            fetcher()
                .then(data => setCache(key, data, ttl))
                .catch(err => console.error('Revalidate error:', err));
        }

        return cached;
    }

    // Cache miss, fetch and cache
    const data = await fetcher();
    await setCache(key, data, ttl);
    return data;
}

/**
 * Invalidate related caches
 * Useful when updating data that affects multiple cache entries
 */
export async function invalidateRelated(patterns: string[]): Promise<void> {
    await Promise.all(patterns.map(pattern => invalidateCache(pattern)));
}

/**
 * Cache warming
 * Pre-populate cache with frequently accessed data
 */
export async function warmCache<T>(
    entries: Array<{ key: string; fetcher: () => Promise<T>; ttl?: number }>
): Promise<void> {
    await Promise.all(
        entries.map(({ key, fetcher, ttl }) =>
            getCached(key, fetcher, ttl || CacheTTL.LONG)
        )
    );
}

/**
 * Batch cache operations
 * Fetch multiple items from cache efficiently
 */
export async function batchGet<T>(keys: string[]): Promise<Map<string, T>> {
    const { getCache } = await import('./redis');

    const results = await Promise.all(
        keys.map(async key => ({
            key,
            value: await getCache<T>(key),
        }))
    );

    return new Map(
        results
            .filter(({ value }) => value !== null)
            .map(({ key, value }) => [key, value as T])
    );
}

/**
 * Cache statistics
 * Track cache hit/miss rates
 */
class CacheStats {
    private hits = 0;
    private misses = 0;

    recordHit() {
        this.hits++;
    }

    recordMiss() {
        this.misses++;
    }

    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

        return {
            hits: this.hits,
            misses: this.misses,
            total,
            hitRate: hitRate.toFixed(2) + '%',
        };
    }

    reset() {
        this.hits = 0;
        this.misses = 0;
    }
}

export const cacheStats = new CacheStats();
