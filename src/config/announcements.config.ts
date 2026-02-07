/**
 * E90/E91 P2：新作上線預告預留
 * 設定新遊戲或新課程上線時，首頁／Lobby／Learn 可顯示「新作上線」橫幅或郵件預告。
 * 上線日與郵件訂閱者名單對齊時，可觸發預告邏輯（見 docs/NEW_LAUNCH_ANNOUNCEMENTS.md）。
 */

export type AnnouncementType = 'game' | 'course'

export interface LaunchAnnouncement {
  type: AnnouncementType
  /** 遊戲 id（games.config GAMES_META）或課程 id（learn） */
  id: string
  /** 顯示用標題，如「新遊戲上線」「新課程上線」 */
  label: string
  /** 橫幅顯示至該日（ISO 字串）；過期後不顯示 */
  showUntil: string
}

/**
 * 當前有效的新作預告；無活動時回傳空陣列。
 * 可改為從 env（如 NEXT_PUBLIC_NEW_GAME_ID）或 API 讀取。
 */
export function getActiveLaunchAnnouncements(): LaunchAnnouncement[] {
  const now = new Date().toISOString().slice(0, 10)
  const list: LaunchAnnouncement[] = []
  // 範例：新遊戲上線時取消註解並填入 id、showUntil
  // list.push({ type: 'game', id: 'truth-or-dare', label: '新遊戲上線', showUntil: '2026-03-01' })
  // 範例：新課程上線時
  // list.push({ type: 'course', id: 'quick-wine-5min', label: '新課程上線', showUntil: '2026-03-01' })
  return list.filter((a) => a.showUntil >= now)
}
