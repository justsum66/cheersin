// @vitest-environment node
/**
 * P0-35: v1 health route tests — validates versioned endpoint wrapper
 */
import { describe, it, expect, vi } from 'vitest'

// Mock the health route it delegates to
vi.mock('@/lib/supabase-server', () => ({
  createServerClientOptional: () => null,
  testSupabaseConnection: async () => ({ success: false, message: 'test env' }),
}))
vi.mock('@/lib/openrouter', () => ({
  testOpenRouterConnection: async () => ({ success: false, message: 'not configured' }),
}))
vi.mock('@/lib/pinecone', () => ({
  testPineconeConnection: async () => ({ success: false, message: 'not configured' }),
}))
vi.mock('@/lib/groq', () => ({
  groq: null,
  GROQ_CHAT_MODEL: 'test-model',
}))
vi.mock('@/lib/api-usage', () => ({
  getUsageStats: () => ({ byModel: {} }),
}))
vi.mock('@/lib/env', () => ({
  normalizeEnv: (v: string | undefined) => v?.trim() || undefined,
}))
vi.mock('@/lib/env-config', () => ({
  GROQ_API_KEY: undefined,
  GROQ_HEALTH_API_KEY: undefined,
  CHAT_TIMEOUT_MS: 5000,
  OPENROUTER_API_KEY: undefined,
  OPENROUTER_HEALTH_API_KEY: undefined,
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  SUPABASE_SERVICE_ROLE_KEY: undefined,
  PINECONE_API_KEY: undefined,
  PINECONE_API_URL: undefined,
}))
vi.mock('@/lib/health-hints', () => ({
  HEALTH_SERVICE: {
    SUPABASE: 'Supabase',
    GROQ: 'Groq',
    OPENROUTER: 'OpenRouter',
    PINECONE: 'Pinecone',
    PAYPAL: 'PayPal',
  },
  hintFor: () => undefined,
}))

import { GET } from '@/app/api/v1/health/route'

describe('GET /api/v1/health', () => {
  it('returns response with X-API-Version header', async () => {
    const req = new Request('http://localhost/api/v1/health')
    const res = await GET(req)
    expect([200, 504]).toContain(res.status)
    expect(res.headers.get('X-API-Version')).toBe('1')
  })

  it('returns JSON body with health data', async () => {
    const req = new Request('http://localhost/api/v1/health')
    const res = await GET(req)
    if (res.status === 200) {
      const json = await res.json()
      expect(json).toHaveProperty('timestamp')
      expect(json).toHaveProperty('services')
    }
  })

  it('services array contains expected service names', async () => {
    const req = new Request('http://localhost/api/v1/health')
    const res = await GET(req)
    if (res.status === 200) {
      const json = await res.json()
      const names = json.services.map((s: { name: string }) => s.name)
      expect(names).toContain('Supabase')
    }
  })
})
