/**
 * 酒局劇本殺 — 劇本內容結構（殺手功能 #13）
 * 章節 content 可為敘事、投票節點、懲罰規則
 */

export type ChapterNodeType = 'narrative' | 'vote' | 'punishment'

export interface ChapterNodeNarrative {
  type: 'narrative'
  text: string
}

export interface ChapterNodeVote {
  type: 'vote'
  prompt: string
  options?: string[]
  /** 投票結果對應的懲罰或下一章 */
  resultAction?: string
}

export interface ChapterNodePunishment {
  type: 'punishment'
  rule: string
  /** 可選：喝幾口、指定對象等 */
  detail?: string
}

export type ChapterNode =
  | ChapterNodeNarrative
  | ChapterNodeVote
  | ChapterNodePunishment

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
}

/** 劇本殺遊戲狀態（與 ScriptRoomState 同義，供頁面/ hook 使用） */
export type ScriptState = ScriptRoomState

/** 5.3 #26：章節 content 型別守衛 */
export function isChapterNode(node: unknown): node is ChapterNode {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return typeof n.type === 'string' && ['narrative', 'vote', 'punishment'].includes(n.type)
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
