/**
 * CLEAN-032: Shared test utilities and fixtures.
 * Common helpers for unit and integration tests.
 */

import { vi } from 'vitest'

// ── Mock User ──
export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-user-001',
    email: 'test@cheersin.app',
    display_name: 'Test User',
    tier: 'free' as const,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// ── Mock Subscription ──
export function createMockSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-001',
    user_id: 'test-user-001',
    plan_id: 'pro',
    status: 'active' as const,
    paypal_subscription_id: 'I-MOCK12345',
    current_period_start: '2026-02-01T00:00:00Z',
    current_period_end: '2026-03-01T00:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
    ...overrides,
  }
}

// ── Mock Payment ──
export function createMockPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay-001',
    user_id: 'test-user-001',
    amount: 199,
    currency: 'TWD',
    status: 'completed' as const,
    paypal_transaction_id: 'TX-MOCK001',
    created_at: '2026-02-01T00:00:00Z',
    ...overrides,
  }
}

// ── Mock Course Progress ──
export function createMockCourseProgress(overrides: Record<string, unknown> = {}) {
  return {
    user_id: 'test-user-001',
    course_slug: 'wine-basics',
    chapter_index: 0,
    completed: false,
    updated_at: '2026-02-01T00:00:00Z',
    ...overrides,
  }
}

// ── Mock Next.js Request ──
export function createMockRequest(
  url: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
) {
  const { method = 'GET', body, headers = {} } = options
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

// ── Mock Supabase Client ──
export function createMockSupabase() {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return {
    from: vi.fn(() => mockQuery),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: createMockUser() }, error: null }),
    },
    _mockQuery: mockQuery,
  }
}

// ── Wait helper ──
export function waitMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Suppress console in tests ──
export function suppressConsole() {
  const spy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  }
  return () => {
    spy.log.mockRestore()
    spy.warn.mockRestore()
    spy.error.mockRestore()
  }
}
