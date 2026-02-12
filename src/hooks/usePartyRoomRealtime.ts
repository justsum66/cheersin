'use client'

/**
 * PR-18：派對房 Realtime 訂閱 — game_rooms 變更時觸發 refetch，可與 usePolling 並存（Realtime 為主、輪詢為 fallback）
 * 需 Supabase 專案啟用 Realtime 且 game_rooms 已加入 publication
 */
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

export function usePartyRoomRealtime(
  slug: string | null,
  onRoomChange: () => void
) {
  const onRoomChangeRef = useRef(onRoomChange)
  onRoomChangeRef.current = onRoomChange

  useEffect(() => {
    if (!slug?.trim()) return
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
    try {
      const supabase = createClient()
      channel = supabase
        .channel(`party-room:${slug}`)
        .on(
          'postgres_changes',
          {
            schema: 'public',
            table: 'game_rooms',
            filter: `slug=eq.${slug}`,
            event: '*',
          },
          () => {
            onRoomChangeRef.current()
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            onRoomChangeRef.current()
          }
        })
    } catch {
      // 無 SUPABASE_URL/KEY 或 Realtime 未啟用時不拋錯，輪詢仍可運作
    }
    return () => {
      if (channel) {
        channel.unsubscribe().catch(() => {})
      }
    }
  }, [slug])
}
