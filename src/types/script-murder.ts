/**
 * 酒局劇本殺 — 劇本內容結構（殺手功能 #13）
 * 章節 content 可為敘事、投票節點、懲罰規則、分支選擇、計時挑戰
 */

export type ChapterNodeType = 'narrative' | 'vote' | 'punishment' | 'choice' | 'timer'

export interface ChapterNodeNarrative {
  type: 'narrative'
  text: string
  /** SM-P14：關鍵詞 highlight */
  highlights?: string[]
  /** SM-P17：NPC 旁白標記 */
  isNpc?: boolean
}

export interface ChapterNodeVote {
  type: 'vote'
  prompt: string
  options?: string[]
  /** 投票結果對應的懲罰或下一章 */
  resultAction?: string
  /** SM-P09：投票倒計時（秒） */
  timerSeconds?: number
}

export interface ChapterNodePunishment {
  type: 'punishment'
  rule: string
  /** 可選：喝幾口、指定對象等 */
  detail?: string
  /** SM-P16：懲罰隨機增強 — 骰子範圍 [min, max] */
  diceRange?: [number, number]
}

/** SM-T01：分支劇情選擇節點 */
export interface ChapterNodeChoice {
  type: 'choice'
  prompt: string
  choices: Array<{ label: string; nextChapterOffset?: number; consequence?: string }>
}

/** SM-T02：計時挑戰節點 */
export interface ChapterNodeTimer {
  type: 'timer'
  prompt: string
  /** 倒計時秒數 */
  seconds: number
  /** 超時懲罰 */
  timeoutPunishment?: string
  /** 完成獎勵 */
  successReward?: string
}

export type ChapterNode =
  | ChapterNodeNarrative
  | ChapterNodeVote
  | ChapterNodePunishment
  | ChapterNodeChoice
  | ChapterNodeTimer

/** script_chapters.content 存 JSON 字串，解析後為單一節點或節點陣列 */
export type ChapterContent = ChapterNode | ChapterNode[]

export interface ScriptChapterRow {
  id: string
  script_id: string
  chapter_index: number
  title: string
  content: string | null
}

export interface ScriptRoleRow {
  id: string
  script_id: string
  role_name: string
  role_description: string | null
  secret_clue: string | null
}

export interface ScriptRow {
  id: string
  title: string
  slug: string | null
  duration_min: number | null
  min_players: number | null
  max_players: number | null
  is_18_plus: boolean | null
}

/** 劇本殺 API：劇本摘要（列表用） */
export interface ScriptSummary {
  id: string
  title: string
  slug: string | null
  durationMin: number | null
  minPlayers: number | null
  maxPlayers: number | null
  is18Plus: boolean
  /** SM-T03：擴展欄位 */
  chapterCount?: number
  roleCount?: number
  themeEmoji?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

/** 劇本殺 API：劇本詳情（含章節與角色） */
export interface ScriptDetail {
  id: string
  title: string
  slug: string | null
  durationMin: number | null
  minPlayers: number | null
  maxPlayers: number | null
  is18Plus: boolean
  chapters: Array<{ id: string; chapterIndex: number; title: string; content: string | null }>
  roles: Array<{ id: string; roleName: string; roleDescription: string | null; secretClue: string | null }>
}

/** 劇本殺 API：房間資訊（GET /api/games/rooms/[slug]） */
export interface ScriptMurderRoomInfo {
  id: string
  slug: string
  hostId: string | null
  maxPlayers: number
  scriptId: string | null
  scriptRoom: boolean
  expiresAt: string | null
}

/** 劇本殺房間內玩家（與 API 回傳一致） */
export interface ScriptMurderPlayer {
  id: string
  displayName: string
  orderIndex: number
}

/** 5.2 #14：劇本房間狀態 payload（game_states.game_id=script_murder） */
export type ScriptRoomPhase = 'lobby' | 'play' | 'ended'

/** SM-R07：玩家準備狀態 */
export type PlayerReadyStatus = 'waiting' | 'ready'

export interface ScriptRoomState {
  scriptId?: string
  phase: ScriptRoomPhase
  chapterIndex: number
  assignments: Record<string, string>
  /** 當前章節投票：playerId -> optionIndex 或 option 字串 */
  votes?: Record<string, string>
  /** 當前章節懲罰是否已確認執行 */
  punishmentDone?: boolean
  /** 僅房主可推進章節／開始投票（5.1 #12） */
  hostId?: string | null
  /** 總章節數（開始遊戲時寫入） */
  totalChapters?: number
  /** 結束統計（5.1 #10、5.4 #42） */
  stats?: {
    chaptersCompleted: number
    voteRounds: number
    punishmentCount: number
  }
  /** SM-T04：投票倒計時結束時間（ISO 字串） */
  voteTimerEnd?: string | null
  /** SM-T04：各玩家準備狀態 */
  playerStatuses?: Record<string, PlayerReadyStatus>
  /** SM-P20：已解鎖書籤章節 index 列表 */
  bookmarkedChapters?: number[]
}

/** 劇本殺遊戲狀態（與 ScriptRoomState 同義，供頁面/ hook 使用） */
export type ScriptState = ScriptRoomState

/** SM-T05：成就系統 */
export type AchievementId =
  | 'first_clear'       // 首次通關
  | 'full_house'        // 全員到齊
  | 'punishment_king'   // 懲罰王（≥5 次）
  | 'vote_master'       // 投票達人（每輪都投票）
  | 'speed_runner'      // 速通玩家（<15 min）
  | 'script_collector'  // 劇本收集家（≥3 劇本）

export interface ScriptAchievement {
  id: AchievementId
  label: string
  emoji: string
  description: string
  unlockedAt?: string
}

export const ACHIEVEMENTS: Record<AchievementId, Omit<ScriptAchievement, 'id' | 'unlockedAt'>> = {
  first_clear: { label: '初次通關', emoji: '🎉', description: '完成你的第一個劇本' },
  full_house: { label: '全員到齊', emoji: '👥', description: '所有角色都被分配' },
  punishment_king: { label: '懲罰王', emoji: '🍺', description: '累計接受 5 次以上懲罰' },
  vote_master: { label: '投票達人', emoji: '🗳️', description: '每輪投票都參與' },
  speed_runner: { label: '速通玩家', emoji: '⚡', description: '15 分鐘內完成劇本' },
  script_collector: { label: '劇本收集家', emoji: '📚', description: '完成 3 個以上不同劇本' },
}

/** 5.3 #26：章節 content 型別守衛 */
export function isChapterNode(node: unknown): node is ChapterNode {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return typeof n.type === 'string' && ['narrative', 'vote', 'punishment', 'choice', 'timer'].includes(n.type)
}

export function parseChapterContent(content: string | null): ChapterNode[] {
  if (!content?.trim()) return []
  try {
    const parsed = JSON.parse(content) as unknown
    if (Array.isArray(parsed)) return parsed.filter(isChapterNode)
    if (isChapterNode(parsed)) return [parsed]
  } catch {
    /* ignore */
  }
  return []
}
