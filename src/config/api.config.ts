/**
 * CLEAN-019: API versioning configuration.
 * Defines the current API version and provides helpers for versioned routes.
 * When migrating to /api/v1/*, use this config for path generation.
 */

export const API_VERSION = 'v1' as const

/** Base path for versioned API routes */
export const API_BASE = `/api/${API_VERSION}`

/** Map of API endpoints for centralized reference */
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_LOGOUT: `${API_BASE}/auth/logout`,

  // Subscription
  SUBSCRIPTION: `${API_BASE}/subscription`,
  SUBSCRIPTION_MANAGE: `${API_BASE}/subscription/manage`,
  SUBSCRIPTION_PAYMENTS: `${API_BASE}/subscription/payments`,
  SUBSCRIPTION_INVOICE: `${API_BASE}/subscription/invoice`,
  SUBSCRIPTION_PAUSE: `${API_BASE}/subscription/pause`,
  SUBSCRIPTION_GIFT: `${API_BASE}/subscription/gift`,
  SUBSCRIPTION_REFUND: `${API_BASE}/subscription/refund`,

  // Webhooks
  WEBHOOKS_PAYPAL: `${API_BASE}/webhooks/paypal`,

  // User
  USER_PROFILE: `${API_BASE}/user/profile`,
  USER_PREFERENCES: `${API_BASE}/user/preferences`,

  // Learn
  COURSES: `${API_BASE}/learn/courses`,
  COURSE_PROGRESS: `${API_BASE}/learn/progress`,

  // Games
  GAMES_LIST: `${API_BASE}/games/list`,
  GAME_ANALYTICS: `${API_BASE}/games/analytics`,

  // Assistant
  ASSISTANT_CHAT: `${API_BASE}/assistant/chat`,

  // Push
  PUSH_SUBSCRIBE: `${API_BASE}/push-subscribe`,

  // Analytics
  ANALYTICS: `${API_BASE}/analytics`,

  // App Version (TWA)
  APP_VERSION: `${API_BASE}/app-version`,
} as const

/**
 * Helper to build an API URL with query params.
 * @example apiUrl(API_ENDPOINTS.COURSES, { limit: 10 }) => '/api/v1/learn/courses?limit=10'
 */
export function apiUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return endpoint
  const searchParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    searchParams.set(k, String(v))
  }
  return `${endpoint}?${searchParams.toString()}`
}
