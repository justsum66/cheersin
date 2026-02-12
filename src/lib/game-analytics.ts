/**
 * 遊戲分析事件追蹤（ANA.1）
 * 統一管理遊戲相關的 analytics 事件，送 /api/analytics（name/value/id 格式）
 */

const VALUE_MAX = 1_000_000

/** 送單一事件：name=事件名, value=數字, id=可選 game_id 等 */
function sendEvent(name: string, value: number, id?: string): void {
  if (typeof window === 'undefined') return
  const payload: { name: string; value: number; id?: string } = { name, value: Math.min(value, VALUE_MAX) }
  if (id) payload.id = id.slice(0, 256)
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {})
  } catch {
    // 忽略錯誤，不阻塞用戶體驗
  }
}

/** 遊戲開始事件（持久化至 analytics_events） */
export function trackGameStart(gameId: string, playerCount: number): void {
  sendEvent('game_start', Math.max(0, playerCount), gameId)
}

/** 遊戲結束事件（duration 單位 ms） */
export function trackGameEnd(gameId: string, durationMs: number, rounds: number): void {
  sendEvent('game_end', Math.max(0, Math.round(durationMs)), gameId)
  if (rounds > 0) sendEvent('game_rounds', Math.min(rounds, VALUE_MAX), gameId)
}

/** 遊戲回合完成（可選，子遊戲呼叫） */
export function trackGameRound(gameId: string, roundNumber: number, action: string): void {
  sendEvent('game_round', Math.max(0, roundNumber), `${gameId}:${action}`.slice(0, 256))
}

/** 遊戲房間創建 */
export function trackRoomCreate(roomId: string, gameType: string): void {
  sendEvent('room_create', 1, `${roomId}:${gameType}`.slice(0, 256))
}

/** 遊戲房間加入 */
export function trackRoomJoin(roomId: string, playerCount: number): void {
  sendEvent('room_join', Math.max(0, playerCount), roomId)
}

/** 遊戲房間離開 */
export function trackRoomLeave(roomId: string, reason?: string): void {
  sendEvent('room_leave', 1, `${roomId}:${reason ?? 'user_action'}`.slice(0, 256))
}

/** PR-27：派對房建立房間 */
export function trackPartyRoomCreate(slug: string, maxPlayers: number): void {
  sendEvent('party_room_create', Math.min(maxPlayers, 12), slug.slice(0, 256))
}

/** PR-27：派對房加入房間 */
export function trackPartyRoomJoin(slug: string, playerCount: number): void {
  sendEvent('party_room_join', Math.max(0, playerCount), slug.slice(0, 256))
}

/** PR-27：派對房乾杯 */
export function trackPartyRoomCheers(slug: string, count: number): void {
  sendEvent('party_room_cheers', Math.max(0, Math.min(count, VALUE_MAX)), slug.slice(0, 256))
}

/** PR-27：派對房房主選遊戲 */
export function trackPartyRoomSelectGame(slug: string, gameId: string): void {
  sendEvent('party_room_select_game', 1, `${slug}:${gameId}`.slice(0, 256))
}
