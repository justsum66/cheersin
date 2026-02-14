'use client'

/**
 * R2-130：訂閱 game_states 的 party-room 變更，供全員乾杯同步
 * 當 cheersCount 遞增時觸發 onCheersSync，由 UI 播放碰杯動畫與震動
 */
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

const PARTY_ROOM_GAME_ID = 'party-room'

export interface PartyGameStatePayload {
  cheersCount?: number
  currentGameId?: string
}

export function usePartyRoomGameStateRealtime(
  roomId: string | null,
  onCheersSync: (newCount: number) => void
) {
  const onCheersSyncRef = useRef(onCheersSync)
  onCheersSyncRef.current = onCheersSync
  const lastCountRef = useRef<number | null>(null)

  useEffect(() => {
    if (!roomId?.trim()) return
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
    try {
      const supabase = createClient()
      channel = supabase
        .channel(`party-game-state:${roomId}`)
        .on(
          'postgres_changes',
          {
            schema: 'public',
            table: 'game_states',
            filter: `room_id=eq.${roomId}`,
            event: '*',
          },
          (payload) => {
            const row = payload.new as { game_id?: string; payload?: unknown } | null
            if (!row || row.game_id !== PARTY_ROOM_GAME_ID) return
            const p = (row.payload ?? {}) as PartyGameStatePayload
            const count = Math.max(0, Number(p.cheersCount) ?? 0)
            const prev = lastCountRef.current
            lastCountRef.current = count
            /** 僅在遞增時觸發（首次 sync 不觸發動畫） */
            if (prev !== null && count > prev) {
              onCheersSyncRef.current(count)
            }
          }
        )
        .subscribe()
    } catch {
      // 無 Realtime 或未啟用時不拋錯
    }
    return () => {
      if (channel) channel.unsubscribe().catch(() => {})
    }
  }, [roomId])
}
