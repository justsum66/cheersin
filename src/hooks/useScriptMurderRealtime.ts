'use client'

/**
 * SM-11：劇本殺房間 Realtime 訂閱 — game_rooms 變更時觸發 refetch（玩家進出、房間設定）
 * SM-001：新增 visibilitychange 處理器，手機休眠喚醒後自動重連
 * 與 usePolling 並存；game_states 仍由輪詢或後續擴充訂閱
 */
import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export function useScriptMurderRealtime(
  slug: string | null,
  onRoomChange: () => void
) {
  const onRoomChangeRef = useRef(onRoomChange)
  onRoomChangeRef.current = onRoomChange
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  /** SM-001: 建立/重建 Realtime channel */
  const setupChannel = useCallback(() => {
    if (!slug?.trim()) return
    
    // 清理舊的 channel
    if (channelRef.current) {
      channelRef.current.unsubscribe().catch(() => {})
      channelRef.current = null
    }

    try {
      if (!supabaseRef.current) {
        supabaseRef.current = createClient()
      }
      const supabase = supabaseRef.current
      
      channelRef.current = supabase
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
  }, [slug])

  useEffect(() => {
    setupChannel()

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe().catch(() => {})
        channelRef.current = null
      }
    }
  }, [setupChannel])

  /** SM-001: 監聽 visibilitychange，手機休眠喚醒後重連 */
  useEffect(() => {
    if (typeof document === 'undefined' || !slug?.trim()) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 頁面從背景恢復前台，重建連線並立即 refetch
        setupChannel()
        onRoomChangeRef.current()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [slug, setupChannel])
}
