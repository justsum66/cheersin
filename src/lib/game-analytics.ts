/**
 * 遊戲分析事件追蹤
 * 統一管理遊戲相關的 analytics 事件
 */

export interface GameAnalyticsEvent {
  event: string
  properties: Record<string, unknown>
}

/**
 * 遊戲開始事件
 */
export function trackGameStart(gameId: string, playerCount: number): void {
  sendAnalytics({
    event: 'game_start',
    properties: {
      game_id: gameId,
      player_count: playerCount,
      timestamp: Date.now()
    }
  })
}

/**
 * 遊戲結束事件
 */
export function trackGameEnd(gameId: string, duration: number, rounds: number): void {
  sendAnalytics({
    event: 'game_end',
    properties: {
      game_id: gameId,
      duration_ms: duration,
      rounds,
      timestamp: Date.now()
    }
  })
}

/**
 * 遊戲回合完成
 */
export function trackGameRound(gameId: string, roundNumber: number, action: string): void {
  sendAnalytics({
    event: 'game_round',
    properties: {
      game_id: gameId,
      round: roundNumber,
      action,
      timestamp: Date.now()
    }
  })
}

/**
 * 遊戲房間創建
 */
export function trackRoomCreate(roomId: string, gameType: string): void {
  sendAnalytics({
    event: 'room_create',
    properties: {
      room_id: roomId,
      game_type: gameType,
      timestamp: Date.now()
    }
  })
}

/**
 * 遊戲房間加入
 */
export function trackRoomJoin(roomId: string, playerCount: number): void {
  sendAnalytics({
    event: 'room_join',
    properties: {
      room_id: roomId,
      player_count: playerCount,
      timestamp: Date.now()
    }
  })
}

/**
 * 遊戲房間離開
 */
export function trackRoomLeave(roomId: string, reason?: string): void {
  sendAnalytics({
    event: 'room_leave',
    properties: {
      room_id: roomId,
      reason: reason || 'user_action',
      timestamp: Date.now()
    }
  })
}

/**
 * 發送 analytics 事件到後端
 */
function sendAnalytics(data: GameAnalyticsEvent): void {
  if (typeof window === 'undefined') return
  
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {
      // 忽略錯誤，不阻塞用戶體驗
    })
  } catch {
    // 忽略錯誤
  }
}
