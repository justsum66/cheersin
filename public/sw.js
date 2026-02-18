/**
 * Task 1.04: Caching Strategy Enhancement
 * Service Worker implementation for offline support and advanced caching
 */

const CACHE_VERSION = 'v1.0.5'
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
      // Pre-cache critical assets — individual adds so one 404 does not block install
      const urlsToCache = [
        '/',
        '/offline.html',
        '/logo_monochrome_gold.png',
        '/manifest.webmanifest'
      ]
      
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => {
          console.warn('[Service Worker] Failed to pre-cache:', url, err.message)
        }))
      )
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
          // Delete old caches (keep current static, dynamic, and game caches)
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE && cacheName !== GAME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[Service Worker] Activation complete')
      // PWA-015: Check storage quota on activation
      checkStorageQuota()
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
  
  // PWA-013: Route game assets to dedicated cache with 30-day TTL
  if (isGameAsset(url.pathname)) {
    event.respondWith(gameAssetCacheFirst(request))
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
      // PWA-019: Use navigation preload response when available
      event.respondWith(networkFirst(request, event))
      break
    default:
      event.respondWith(networkFirst(request, event))
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
/** PWA-005: HTML pages always network-first with cache-busting query param stripped */
async function networkFirst(request, fetchEvent) {
  // Strip cache-busting params for HTML requests to normalize cache keys
  let cleanRequest = request
  if (request.mode === 'navigate') {
    const url = new URL(request.url)
    url.searchParams.delete('_sw')
    url.searchParams.delete('_t')
    cleanRequest = new Request(url.toString(), { headers: request.headers, mode: request.mode })
  }
  try {
    // PWA-019: Prefer navigation preload response when available
    const preloadResponse = fetchEvent && fetchEvent.preloadResponse
      ? await fetchEvent.preloadResponse
      : undefined
    const networkResponse = preloadResponse || await fetch(cleanRequest)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(cleanRequest, networkResponse.clone())
      await enforceCacheLimit(DYNAMIC_CACHE, CACHE_CONFIG.MAX_ENTRIES.DYNAMIC)
    }
    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(cleanRequest)
    
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

// PWA-013: Game asset cache-first with 30-day TTL
async function gameAssetCacheFirst(request) {
  const cache = await caches.open(GAME_CACHE)
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    const age = getCacheAge(cachedResponse)
    if (age < GAME_CACHE_MAX_AGE) return cachedResponse
  }
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      await enforceCacheLimit(GAME_CACHE, GAME_CACHE_MAX_ENTRIES)
    }
    return networkResponse
  } catch {
    if (cachedResponse) return cachedResponse
    return new Response('Game asset unavailable offline', { status: 503 })
  }
}

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

// ======== PWA-009: Background Sync for failed form submissions ========
const BG_SYNC_QUEUE = 'cheersin-bg-sync-queue'

self.addEventListener('sync', (event) => {
  if (event.tag === 'form-submit-retry') {
    event.waitUntil(replayQueuedRequests())
  }
})

async function replayQueuedRequests() {
  try {
    const cache = await caches.open(BG_SYNC_QUEUE)
    const keys = await cache.keys()
    for (const request of keys) {
      const cachedResp = await cache.match(request)
      if (!cachedResp) continue
      const body = await cachedResp.text()
      try {
        await fetch(request.url, {
          method: request.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
        await cache.delete(request)
      } catch {
        console.warn('[SW] Background sync retry failed for', request.url)
      }
    }
  } catch (err) {
    console.error('[SW] Background sync error:', err)
  }
}

// ======== PWA-010: Periodic Background Sync for course progress ========
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-course-progress') {
    event.waitUntil(syncCourseProgress())
  }
})

async function syncCourseProgress() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' })
    for (const client of clients) {
      client.postMessage({ type: 'SYNC_COURSE_PROGRESS' })
    }
  } catch (err) {
    console.warn('[SW] Periodic sync error:', err)
  }
}

// ======== PWA-013: Separate game asset cache with longer TTL ========
const GAME_CACHE = `cheersin-games-${CACHE_VERSION}`
const GAME_CACHE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds
const GAME_CACHE_MAX_ENTRIES = 200

function isGameAsset(pathname) {
  return /^\/(games|_next\/static)\/.*\.(png|jpg|jpeg|webp|avif|svg|gif|mp3|ogg|wav)$/i.test(pathname)
    || pathname.startsWith('/images/games/')
}

// ======== PWA-015: Cache Storage Quota Management ========
async function checkStorageQuota() {
  if (!navigator.storage || !navigator.storage.estimate) return
  try {
    const { usage, quota } = await navigator.storage.estimate()
    const usedMB = (usage || 0) / (1024 * 1024)
    const quotaMB = (quota || 0) / (1024 * 1024)
    if (usedMB > 50) {
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        client.postMessage({
          type: 'CACHE_QUOTA_WARNING',
          usage: Math.round(usedMB),
          quota: Math.round(quotaMB),
        })
      }
    }
  } catch {
    // storage API not available
  }
}

// ======== PWA-019: Navigation Preload for faster SW responses ========
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
      }
    })()
  )
})

// Service Worker runs as classic script (not ES module)