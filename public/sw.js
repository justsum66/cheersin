/**
 * Task 1.04: Caching Strategy Enhancement
 * Service Worker implementation for offline support and advanced caching
 */

const CACHE_VERSION = 'v1.0.4'
const CACHE_NAME = `cheersin-cache-${CACHE_VERSION}`
const DYNAMIC_CACHE = `cheersin-dynamic-${CACHE_VERSION}`

// Cache strategies
const CACHE_STRATEGIES = {
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first'
}

// URL patterns to cache
const CACHE_PATTERNS = {
  // Static assets - cache first
  STATIC: [
    /\.(js|css|woff2|woff|ttf|png|jpg|jpeg|gif|webp|avif|svg)$/,
    '/_next/static/',
    '/logo_monochrome_gold.png'
  ],
  
  // API routes - stale while revalidate
  API: [
    '/api/learn/courses',
    '/api/games/list',
    '/api/user/profile'
  ],
  
  // Pages - network first for fresh content
  PAGES: [
    '/learn/',
    '/games/',
    '/profile/'
  ]
}

// Cache configuration
const CACHE_CONFIG = {
  // Maximum cache age in seconds
  MAX_AGE: {
    STATIC: 31536000, // 1 year
    API: 300, // 5 minutes
    PAGES: 60 // 1 minute
  },
  
  // Cache size limits
  MAX_ENTRIES: {
    STATIC: 100,
    DYNAMIC: 50
  }
}

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version', CACHE_VERSION)
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Pre-cache critical assets
      const urlsToCache = [
        '/',
        '/logo_monochrome_gold.png',
        '/manifest.webmanifest'
      ]
      
      return cache.addAll(urlsToCache)
    }).then(() => {
      console.log('[Service Worker] Installation complete')
      return self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[Service Worker] Activation complete')
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests and requests to other origins
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }
  
  // Determine cache strategy based on URL
  const strategy = getCacheStrategy(url.pathname)
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request))
      break
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request))
      break
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request))
      break
    default:
      // For other requests, try network first with cache fallback
      event.respondWith(networkFirst(request))
  }
})

// Cache First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    // Check if cache is expired
    const cacheAge = getCacheAge(cachedResponse)
    if (cacheAge < CACHE_CONFIG.MAX_AGE.STATIC) {
      console.log('[Service Worker] Cache hit (cache-first):', request.url)
      return cachedResponse
    }
  }
  
  // Fetch from network and cache
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      await enforceCacheLimit(CACHE_NAME, CACHE_CONFIG.MAX_ENTRIES.STATIC)
    }
    return networkResponse
  } catch (error) {
    // Fallback to cache if network fails
    if (cachedResponse) {
      console.log('[Service Worker] Network failed, using cache:', request.url)
      return cachedResponse
    }
    throw error
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Always try to fetch fresh data
  const fetchPromise = fetch(request).then(async networkResponse => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      await enforceCacheLimit(DYNAMIC_CACHE, CACHE_CONFIG.MAX_ENTRIES.DYNAMIC)
    }
    return networkResponse
  }).catch(error => {
    console.warn('[Service Worker] Network fetch failed:', error)
    throw error
  })
  
  // Return cached response immediately if available
  if (cachedResponse) {
    console.log('[Service Worker] Cache hit (stale-while-revalidate):', request.url)
    // Update cache in background
    fetchPromise.catch(() => {}) // Ignore errors in background update
    return cachedResponse
  }
  
  // Wait for network response if no cache
  return fetchPromise
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
      await enforceCacheLimit(DYNAMIC_CACHE, CACHE_CONFIG.MAX_ENTRIES.DYNAMIC)
    }
    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('[Service Worker] Network failed, using cache:', request.url)
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/offline.html')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    throw error
  }
}

// Helper functions
function getCacheStrategy(pathname) {
  // Static assets
  if (CACHE_PATTERNS.STATIC.some(pattern => 
    typeof pattern === 'string' ? pathname.includes(pattern) : pattern.test(pathname)
  )) {
    return CACHE_STRATEGIES.CACHE_FIRST
  }
  
  // API routes
  if (CACHE_PATTERNS.API.some(pattern => pathname.includes(pattern))) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
  }
  
  // Pages
  if (CACHE_PATTERNS.PAGES.some(pattern => pathname.startsWith(pattern))) {
    return CACHE_STRATEGIES.NETWORK_FIRST
  }
  
  return CACHE_STRATEGIES.NETWORK_FIRST
}

function getCacheAge(response) {
  const dateHeader = response.headers.get('date')
  if (!dateHeader) return Infinity
  
  const cacheTime = new Date(dateHeader).getTime()
  const now = Date.now()
  return (now - cacheTime) / 1000 // seconds
}

async function enforceCacheLimit(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxEntries) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
    console.log(`[Service Worker] Enforced cache limit, deleted ${keysToDelete.length} entries`)
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'CACHE_INVALIDATE':
      invalidateCache(event.data.pattern)
      break
      
    case 'CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats)
      })
      break
  }
})

async function invalidateCache(pattern) {
  const cacheNames = [CACHE_NAME, DYNAMIC_CACHE]
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    const keysToDelete = keys.filter(key => {
      if (typeof pattern === 'string') {
        return key.url.includes(pattern)
      } else {
        return pattern.test(key.url)
      }
    })
    
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
    console.log(`[Service Worker] Invalidated ${keysToDelete.length} cache entries for pattern:`, pattern)
  }
}

async function getCacheStats() {
  const stats = {
    static: { size: 0, entries: 0 },
    dynamic: { size: 0, entries: 0 }
  }
  
  try {
    const staticCache = await caches.open(CACHE_NAME)
    const staticKeys = await staticCache.keys()
    stats.static.entries = staticKeys.length
    
    const dynamicCache = await caches.open(DYNAMIC_CACHE)
    const dynamicKeys = await dynamicCache.keys()
    stats.dynamic.entries = dynamicKeys.length
  } catch (error) {
    console.error('[Service Worker] Failed to get cache stats:', error)
  }
  
  return stats
}

export {} // Make this a module