'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase'

/** 瀏覽器端 Supabase client；未設定 env 時回傳 null（登入頁改為模擬） */
export function useSupabase(): ReturnType<typeof createClient> | null {
  return useMemo(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])
}
