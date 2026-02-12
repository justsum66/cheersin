'use client'

/**
 * SM-11：劇本殺房間 Realtime 訂閱 — game_rooms 變更時觸發 refetch（玩家進出、房間設定）
 * 與 usePolling 並存；game_states 仍由輪詢或後續擴充訂閱
 */
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

export function useScriptMurderRealtime(
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
        .channel(`script-murder-room:${slug}`)
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
      /* Realtime 未啟用時輪詢仍可運作 */
    }
    return () => {
      if (channel) {
        channel.unsubscribe().catch(() => {})
      }
    }
  }, [slug])
}
