/* 291 Service Worker：離線快取靜態資源與 fallback（PWA 離線支援） */
/* Phase 1 E2.1: Service Worker 優化 - 智能快取策略；v4：修正 activate 清理舊 runtime 快取、移除 /logo.png 依賴 */
const CACHE_VERSION = 'v4'
const CACHE_NAME = `cheersin-${CACHE_VERSION}`
const RUNTIME_CACHE = `cheersin-runtime-${CACHE_VERSION}`

/* 靈態資源快取（cache-first）；PWA.2 離線 fallback 頁 */
const STATIC_URLS = [
  '/',
  '/offline.html',
  '/sizes/favicon_32.png',
  '/sizes/favicon_16.png',
  '/logo_monochrome_gold.png',
  '/sizes/android_192.png',
  '/sizes/android_512.png'
]

/* 動態資源快取模式（stale-while-revalidate）；P3-431 納入 /learn 頁面 */
const SWR_PATTERNS = [
  /\/_next\/static\//,
  /\.(?:js|css|woff2?)$/,
  /\/images\//,
  /^\/learn\/?/,
]

/* 不快取的路徑 */
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /\/_next\/data\//
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS)).then(() => self.skipWaiting()).catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const toDelete = keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
      return Promise.all(toDelete.map((k) => caches.delete(k)))
    }).then(() => self.clients.claim())
  )
})

/* PWA 更新提示：處理 SKIP_WAITING 訊息 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  /* 跳過不快取的路徑 */
  if (NO_CACHE_PATTERNS.some(p => p.test(url.pathname))) return
  
  /* 跳過非同源請求 */
  if (event.request.mode !== 'navigate' && !event.request.url.startsWith(self.location.origin)) return
  
  /* 靈態資源：cache-first */
  if (STATIC_URLS.some(u => url.pathname === u || url.pathname.endsWith(u))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
    return
  }
  
  /* SWR 資源：stale-while-revalidate */
  if (SWR_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone())
            return response
          }).catch(() => cached)
          return cached || fetchPromise
        })
      })
    )
    return
  }
  
  /* 預設：network-first 與離線 fallback */
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res.ok && res.type === 'basic') {
        const clone = res.clone()
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clone)).catch(() => {})
      }
      return res
    }).catch(() => {
      return caches.match(event.request).then((cached) => {
        if (cached) return cached
        if (event.request.mode === 'navigate') return caches.match('/offline.html').then((off) => off || caches.match('/'))
        return new Response('', { status: 503, statusText: 'Offline' })
      })
    })
  )
})

/* 294 推播：收到 push 時顯示通知 */
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload = { title: 'Cheersin', body: '您有一則新通知' }
  try {
    const data = event.data.json()
    if (data.title) payload.title = data.title
    if (data.body) payload.body = data.body
  } catch {
    payload.body = event.data.text() || payload.body
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/sizes/android_192.png',
      badge: '/sizes/android_192.png',
      tag: 'cheersin-push',
      renotify: true
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0 && clientList[0].focus) clientList[0].focus()
      else if (self.clients.openWindow) self.clients.openWindow('/')
    })
  )
})

/* 295 背景同步：sync 事件重試離線時排隊的請求（可擴充為 IndexedDB 佇列） */
const SYNC_TAG = 'cheersin-sync'
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      Promise.resolve().then(() => {
        /* 可在此從 IndexedDB 讀取失敗請求並重試 POST */
        return Promise.resolve()
      })
    )
  }
})
