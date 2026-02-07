/**
 * P0-06：API route 取得當前登入用戶（依 cookie session）
 * 供需要驗證身份的 API（如 subscription）使用
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { normalizeEnv, normalizeUrl } from './env'

export interface CurrentUser {
  id: string
}

/**
 * 從 cookie 取得當前 Supabase 用戶；未登入回傳 null
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
        })
      },
    },
  })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user?.id) return null
  return { id: user.id }
}
