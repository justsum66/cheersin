/**
 * PWA-003: Service Worker registration with update prompt
 * Registers the SW if supported, and listens for updates to show a prompt.
 */

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      // Check for updates periodically (every 60 min); store ID for cleanup
      const updateInterval = setInterval(() => {
        registration.update().catch(() => {})
      }, 60 * 60 * 1000)
      window.addEventListener('beforeunload', () => clearInterval(updateInterval), { once: true })

      // Listen for new SW waiting to activate
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW is ready — show update prompt
            showUpdatePrompt(registration)
          }
        })
      })
    } catch (err) {
      console.warn('[SW Register] Registration failed:', err)
    }
  })
}

function showUpdatePrompt(registration: ServiceWorkerRegistration): void {
  // Dispatch custom event that UI components can listen for
  const event = new CustomEvent('sw-update-available', {
    detail: { registration },
  })
  window.dispatchEvent(event)
}

/**
 * Tell the waiting SW to skip waiting and take control.
 * Call this when user clicks "Update" in the UI prompt.
 */
export function applyServiceWorkerUpdate(registration: ServiceWorkerRegistration): void {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    // Reload once the new SW takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
}
