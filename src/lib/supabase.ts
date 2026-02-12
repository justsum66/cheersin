import { createBrowserClient } from '@supabase/ssr'
import { normalizeEnv, normalizeUrl } from '@/lib/env'

/** SEC-009：JWT 刷新由 @supabase/ssr createBrowserClient 自動處理；401 由各 API 呼叫端或統一 error boundary 處理 */
/** 瀏覽器端 Supabase client（anon key，受 RLS 限制）；用於登入、profiles、Realtime */
export function createClient() {
  const url = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createBrowserClient(url, key)
}
