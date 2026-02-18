/**
 * Task 1.04: Advanced Caching Strategy Refinement
 * Enhanced with cache warming, intelligent invalidation, and performance analytics
 */

import { cache } from 'react'
import { unstable_cache } from 'next/cache'

const __DEV__ = process.env.NODE_ENV !== 'production'

// Enhanced cache configuration with warming strategies
export const CACHE_CONFIG = {
  // Time-based cache durations
  DURATIONS: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
    STATIC: 31536000, // 1 year
    WARMING: 1800 // 30 minutes for cache warming
  },
  
  // Cache tags for intelligent invalidation
  TAGS: {
    USER: 'user',
    GAME: 'game',
    LEARN: 'learn',
    CONTENT: 'content',
    METADATA: 'metadata',
    SESSION: 'session',
    REALTIME: 'realtime'
  },
  
  // Cache strategies with warming support
  STRATEGIES: {
    SWR: 'stale-while-revalidate',
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    NETWORK_ONLY: 'network-only',
    WARMING: 'cache-warming'
  },
  
  // Cache warming configuration
  WARMING: {
    ENABLED: true,
    INTERVAL: 900000, // 15 minutes
    PRIORITY_TAGS: ['user', 'game', 'learn'],
    MAX_CONCURRENT: 5
  }
} as const

/**
 * Cache warming manager for proactive cache population
 */
export class CacheWarmingManager {
  private warmingTasks: Map<string, { 
    fetcher: () => Promise<unknown>; 
    interval: NodeJS.Timeout; 
    priority: number 
  }> = new Map()
  private activeWarming: Set<string> = new Set()
  
  async addWarmingTask(
    key: string,
    fetcher: () => Promise<unknown>,
    priority: number = 1
  ): Promise<void> {
    if (!CACHE_CONFIG.WARMING.ENABLED) return
    
    // Remove existing task if it exists
    this.removeWarmingTask(key)
    
    // Add new warming task
    const interval = setInterval(async () => {
      if (this.activeWarming.size >= CACHE_CONFIG.WARMING.MAX_CONCURRENT) return
      
      this.activeWarming.add(key)
      try {
        if (__DEV__) console.log(`[Cache Warming] Warming cache for ${key}`)
        await fetcher()
        if (__DEV__) console.log(`[Cache Warming] Successfully warmed ${key}`)
      } catch (error) {
        console.warn(`[Cache Warming] Failed to warm ${key}:`, error)
      } finally {
        this.activeWarming.delete(key)
      }
    }, CACHE_CONFIG.WARMING.INTERVAL)
    
    this.warmingTasks.set(key, { fetcher, interval, priority })
    if (__DEV__) console.log(`[Cache Warming] Added warming task for ${key}`)
  }
  
  removeWarmingTask(key: string): void {
    const task = this.warmingTasks.get(key)
    if (task) {
      clearInterval(task.interval)
      this.warmingTasks.delete(key)
      if (__DEV__) console.log(`[Cache Warming] Removed warming task for ${key}`)
    }
  }
  
  getWarmingStats(): {
    totalTasks: number;
    activeTasks: number;
    priorityTasks: number;
  } {
    const totalTasks = this.warmingTasks.size
    const activeTasks = this.activeWarming.size
    const priorityTasks = Array.from(this.warmingTasks.values())
      .filter(task => CACHE_CONFIG.WARMING.PRIORITY_TAGS.some(tag => task.fetcher.toString().includes(tag)))
      .length
    
    return { totalTasks, activeTasks, priorityTasks }
  }
  
  async warmAll(): Promise<void> {
    if (__DEV__) console.log('[Cache Warming] Starting full cache warming')
    const tasks = Array.from(this.warmingTasks.entries())
      .sort(([, a], [, b]) => b.priority - a.priority) // Sort by priority
      
    // Execute warming tasks with concurrency limit
    const chunks = this.chunkArray(tasks, CACHE_CONFIG.WARMING.MAX_CONCURRENT)
    
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async ([key, task]) => {
          try {
            await task.fetcher()
            if (__DEV__) console.log(`[Cache Warming] Warmed ${key}`)
          } catch (error) {
            console.warn(`[Cache Warming] Failed to warm ${key}:`, error)
          }
        })
      )
    }
    
    if (__DEV__) console.log('[Cache Warming] Full cache warming completed')
  }
  
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}

// Global cache warming manager
export const cacheWarmingManager = new CacheWarmingManager()

export function generateCacheKey(
  namespace: string,
  identifier: string | number,
  ...params: (string | number | boolean)[]
): string {
  const paramStr = params.length > 0 ? `:${params.join(':')}` : ''
  return `${namespace}:${identifier}${paramStr}`
}

/**
 * Client-side cache with SWR pattern
 */
export class ClientCache<T> {
  private cache: Map<string, { data: T; timestamp: number; stale: boolean }> = new Map()
  private subscribers: Map<string, Set<(data: T) => void>> = new Map()
  
  constructor(private defaultTtl: number = CACHE_CONFIG.DURATIONS.MEDIUM) {}
  
  /**
   * Get cached data with SWR behavior
   */
  async get(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<T> {
    const { ttl = this.defaultTtl, skipCache = false } = options
    
    // Return cached data if available and not expired
    const cached = this.cache.get(key)
    const now = Date.now()
    
    if (cached && !skipCache) {
      const isExpired = now - cached.timestamp > ttl * 1000
      const isStale = now - cached.timestamp > (ttl * 1000) / 2 // Consider stale after half TTL
      
      // Return stale data immediately
      if (!isExpired) {
        if (isStale && !cached.stale) {
          // Mark as stale and fetch fresh data in background
          cached.stale = true
          this.fetchAndUpdate(key, fetcher).catch(console.error)
        }
        return cached.data
      }
    }
    
    // Fetch fresh data
    try {
      const data = await fetcher()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      // If we have stale data, return it as fallback
      if (cached) {
        console.warn(`[Cache] Returning stale data for ${key} due to fetch error:`, error)
        return cached.data
      }
      throw error
    }
  }
  
  /**
   * Set data in cache
   */
  set(key: string, data: T, ttl: number = this.defaultTtl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      stale: false
    })
    
    // Notify subscribers
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      subscribers.forEach(callback => callback(data))
    }
    
    // Set expiration timeout
    setTimeout(() => {
      this.cache.delete(key)
    }, ttl * 1000)
  }
  
  /**
   * Subscribe to cache updates
   */
  subscribe(key: string, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    
    const subscribers = this.subscribers.get(key)!
    subscribers.add(callback)
    
    return () => {
      subscribers.delete(callback)
      if (subscribers.size === 0) {
        this.subscribers.delete(key)
      }
    }
  }
  
  /**
   * Invalidate cache entries
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    if (__DEV__) console.log(`[Cache] Invalidated ${key}`)
  }
  
  /**
   * Invalidate by tag pattern
   */
  invalidateByTag(tag: string): void {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (key.includes(tag)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.invalidate(key))
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.subscribers.clear()
    if (__DEV__) console.log('[Cache] Cleared all cache')
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    staleEntries: number;
  } {
    const totalEntries = this.cache.size
    const staleEntries = Array.from(this.cache.values()).filter(entry => entry.stale).length
    
    return {
      size: totalEntries,
      hitRate: totalEntries > 0 ? ((totalEntries - staleEntries) / totalEntries) * 100 : 0,
      staleEntries
    }
  }
  
  private async fetchAndUpdate(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher()
      const cached = this.cache.get(key)
      if (cached) {
        cached.data = data
        cached.timestamp = Date.now()
        cached.stale = false
        
        // Notify subscribers of update
        const subscribers = this.subscribers.get(key)
        if (subscribers) {
          subscribers.forEach(callback => callback(data))
        }
      }
    } catch (error) {
      console.error(`[Cache] Failed to update ${key}:`, error)
    }
  }
}

/**
 * Enhanced client cache with warming support and advanced analytics
 */
export class EnhancedClientCache<T> extends ClientCache<T> {
  constructor(defaultTtl: number = CACHE_CONFIG.DURATIONS.MEDIUM) {
    super(defaultTtl)
  }
  
  /**
   * Get with warming support
   */
  async getWithWarming(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      skipCache?: boolean;
      enableWarming?: boolean;
      warmingPriority?: number;
    } = {}
  ): Promise<T> {
    const { enableWarming = true, warmingPriority = 1, ...cacheOptions } = options
    
    // Add warming task if enabled
    if (enableWarming) {
      cacheWarmingManager.addWarmingTask(key, fetcher, warmingPriority).catch(console.error)
    }
    
    return this.get(key, fetcher, cacheOptions)
  }
  
  /**
   * Batch cache operations for better performance
   */
  async batchGet(
    requests: Array<{
      key: string;
      fetcher: () => Promise<T>;
      options?: { ttl?: number; skipCache?: boolean }
    }>
  ): Promise<T[]> {
    const results: T[] = []
    
    // Process in chunks to avoid overwhelming the system
    const chunks = this.chunkArray(requests, 10)
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (request) => {
          try {
            return await this.get(request.key, request.fetcher, request.options)
          } catch (error) {
            console.error(`[Cache] Batch get failed for ${request.key}:`, error)
            throw error
          }
        })
      )
      results.push(...chunkResults)
    }
    
    return results
  }
  
  /**
   * Cache analytics and reporting
   */
  getDetailedStats(): {
    basicStats: ReturnType<ClientCache<T>['getStats']>
    performance: ReturnType<CachePerformanceMonitor['getAllMetrics']>
    warming: ReturnType<CacheWarmingManager['getWarmingStats']>
    cacheEfficiency: number
  } {
    const basicStats = this.getStats()
    const performance = cachePerformanceMonitor.getAllMetrics()
    const warming = cacheWarmingManager.getWarmingStats()
    
    // Calculate overall cache efficiency
    const totalHits = Object.values(performance).reduce((sum, metrics) => sum + metrics.hitRate, 0)
    const cacheEfficiency = Object.keys(performance).length > 0 
      ? totalHits / Object.keys(performance).length 
      : 0
    
    return {
      basicStats,
      performance,
      warming,
      cacheEfficiency
    }
  }
  
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}

// Enhanced global cache instance
export const enhancedClientCache = new EnhancedClientCache()

/**
 * Cache performance monitoring
 */
export class CachePerformanceMonitor {
  private metrics: Map<string, {
    hits: number;
    misses: number;
    fetchTimes: number[];
    cacheTimes: number[];
    lastAccess: number;
  }> = new Map();
  
  // Cache performance methods
  recordHit(key: string) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0,
        misses: 0,
        fetchTimes: [],
        cacheTimes: [],
        lastAccess: Date.now()
      });
    }
    const metric = this.metrics.get(key)!;
    metric.hits++;
    metric.lastAccess = Date.now();
  }
  
  recordMiss(key: string) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0,
        misses: 0,
        fetchTimes: [],
        cacheTimes: [],
        lastAccess: Date.now()
      });
    }
    const metric = this.metrics.get(key)!;
    metric.misses++;
    metric.lastAccess = Date.now();
  }
  
  recordFetchTime(key: string, time: number) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0,
        misses: 0,
        fetchTimes: [],
        cacheTimes: [],
        lastAccess: Date.now()
      });
    }
    const metric = this.metrics.get(key)!;
    metric.fetchTimes.push(time);
  }
  
  recordCacheTime(key: string, time: number) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0,
        misses: 0,
        fetchTimes: [],
        cacheTimes: [],
        lastAccess: Date.now()
      });
    }
    const metric = this.metrics.get(key)!;
    metric.cacheTimes.push(time);
  }
  
  getMetrics(key: string) {
    const metric = this.metrics.get(key);
    if (!metric) {
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        averageFetchTime: 0,
        averageCacheTime: 0
      };
    }
    
    const totalRequests = metric.hits + metric.misses;
    const hitRate = totalRequests > 0 ? (metric.hits / totalRequests) * 100 : 0;
    const averageFetchTime = metric.fetchTimes.length > 0 
      ? metric.fetchTimes.reduce((a, b) => a + b, 0) / metric.fetchTimes.length 
      : 0;
    const averageCacheTime = metric.cacheTimes.length > 0 
      ? metric.cacheTimes.reduce((a, b) => a + b, 0) / metric.cacheTimes.length 
      : 0;
    
    return {
      hits: metric.hits,
      misses: metric.misses,
      hitRate,
      averageFetchTime,
      averageCacheTime
    };
  }
  
  getAllMetrics() {
    const result: Record<string, ReturnType<CachePerformanceMonitor['getMetrics']>> = {};
    for (const key of this.metrics.keys()) {
      result[key] = this.getMetrics(key);
    }
    return result;
  }
  
  // Image performance methods (kept for backward compatibility)
  recordLoadTime(
    imageId: string, 
    loadTime: number, 
    size: number,
    format: string = 'unknown',
    quality: number = 75
  ) {
    // Store image metrics separately if needed
    if (!this.metrics.has(imageId)) {
      this.metrics.set(imageId, {
        hits: 0,
        misses: 0,
        fetchTimes: [],
        cacheTimes: [],
        lastAccess: Date.now()
      });
    }
    
    // For image-specific metrics, we can add them to a separate collection
    // but for now we'll just log them
    if (__DEV__) console.log(`[Image Perf] ${imageId}: Load time=${loadTime}ms, Size=${size}, Format=${format}, Quality=${quality}%`);
  }
  
  getAverageLoadTime(): number {
    // This method maintains backward compatibility
    const allFetchTimes: number[] = [];
    this.metrics.forEach(metric => {
      allFetchTimes.push(...metric.fetchTimes);
    });
    return allFetchTimes.length > 0 ? allFetchTimes.reduce((a, b) => a + b, 0) / allFetchTimes.length : 0;
  }
  
  getAverageSize(): number {
    // This method maintains backward compatibility
    return 0; // Placeholder - would need to store size info separately
  }
  
  getFormatPerformance(): Record<string, { count: number; avgLoadTime: number }> {
    // This method maintains backward compatibility
    return {}; // Placeholder
  }
  
  getImageMetrics() {
    return {
      totalImages: this.metrics.size,
      averageLoadTime: this.getAverageLoadTime(),
      averageSize: this.getAverageSize(),
      formatPerformance: this.getFormatPerformance(),
      metrics: Object.fromEntries(this.metrics)
    }
  }
}

// Global instances
export const clientCache = new ClientCache()
export const cachePerformanceMonitor = new CachePerformanceMonitor()

// Predefined cache keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => generateCacheKey('user', userId, 'profile'),
  USER_PREFERENCES: (userId: string) => generateCacheKey('user', userId, 'preferences'),
  GAME_LIST: () => generateCacheKey('games', 'list'),
  GAME_DATA: (gameId: string) => generateCacheKey('game', gameId),
  LEARN_COURSES: () => generateCacheKey('learn', 'courses'),
  LEARN_PROGRESS: (userId: string) => generateCacheKey('learn', userId, 'progress'),
  CONTENT_METADATA: (contentId: string) => generateCacheKey('content', contentId, 'metadata')
} as const

export function createCachedFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: {
    key: string;
    tags?: string[];
    revalidate?: number;
    strategy?: keyof typeof CACHE_CONFIG.STRATEGIES;
  }
) {
  const { key, tags = [], revalidate = CACHE_CONFIG.DURATIONS.MEDIUM, strategy = 'SWR' } = options

  // Use Next.js unstable_cache for server-side caching
  const cachedFn = unstable_cache(
    async (...args: Args) => {
      if (__DEV__) console.log(`[Cache] Executing ${key} with args:`, args)
      const result = await fn(...args)
      if (__DEV__) console.log(`[Cache] Cached ${key} result`)
      return result
    },
    [key],
    { 
      revalidate,
      tags 
    }
  )

  return cachedFn
}