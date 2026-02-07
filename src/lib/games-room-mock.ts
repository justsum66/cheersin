/**
 * 開發用 in-memory 房間儲存（Supabase 不可用時 fallback）
 * 僅在 NODE_ENV=development 時使用
 */

export interface MockRoom {
  id: string
  slug: string
  created_at: string
  /** A1-12：4 位數密碼，mock 存明文以便驗證 */
  password?: string
}

export interface MockPlayer {
  id: string
  room_id: string
  display_name: string
  order_index: number
  /** A1-13：是否為觀戰者 */
  is_spectator?: boolean
}

/** Per-room per-game state (e.g. up-down-stairs payload) */
export interface MockGameState {
  room_id: string
  game_id: string
  payload: Record<string, unknown>
  updated_at: string
}

const rooms = new Map<string, MockRoom>()
const playersByRoom = new Map<string, MockPlayer[]>()
const gameStatesByKey = new Map<string, MockGameState>()
let idCounter = 0

function gameStateKey(roomId: string, gameId: string): string {
  return `${roomId}:${gameId}`
}
function nextId() {
  return `mock-${Date.now()}-${++idCounter}`
}

export function mockCreateRoom(slug: string, password?: string): MockRoom {
  const room: MockRoom = {
    id: nextId(),
    slug,
    created_at: new Date().toISOString(),
    ...(typeof password === 'string' && /^\d{4}$/.test(password) ? { password } : {}),
  }
  rooms.set(slug, room)
  return room
}

export function mockGetRoomBySlug(slug: string): MockRoom | null {
  return rooms.get(slug) ?? null
}

export function mockGetPlayers(roomId: string): MockPlayer[] {
  return (playersByRoom.get(roomId) ?? []).sort((a, b) => a.order_index - b.order_index)
}

/** A1-12：密碼驗證；A1-13：觀戰者不佔玩家名額 */
export function mockJoinRoom(
  roomId: string,
  displayName: string,
  maxPlayers: number,
  password?: string,
  isSpectator?: boolean
): { player: MockPlayer; players: MockPlayer[] } | { error: string } {
  const room = [...rooms.values()].find((r) => r.id === roomId)
  if (room?.password && room.password !== password) return { error: '房間密碼錯誤' }
  const list = playersByRoom.get(roomId) ?? []
  const playerCount = list.filter((p) => !p.is_spectator).length
  if (!isSpectator && playerCount >= maxPlayers) return { error: 'Room full' }
  const orderIndex = isSpectator ? list.length : playerCount
  const newPlayer: MockPlayer = {
    id: nextId(),
    room_id: roomId,
    display_name: displayName,
    order_index: orderIndex,
    ...(isSpectator ? { is_spectator: true } : {}),
  }
  list.push(newPlayer)
  playersByRoom.set(roomId, list)
  return { player: newPlayer, players: [...list].sort((a, b) => a.order_index - b.order_index) }
}

/** GET game state for room+game; null if none */
export function mockGetGameState(roomId: string, gameId: string): MockGameState | null {
  return gameStatesByKey.get(gameStateKey(roomId, gameId)) ?? null
}

/** UPSERT game state (create or replace payload for room+game) */
export function mockUpsertGameState(roomId: string, gameId: string, payload: Record<string, unknown>): MockGameState {
  const key = gameStateKey(roomId, gameId)
  const now = new Date().toISOString()
  const state: MockGameState = { room_id: roomId, game_id: gameId, payload, updated_at: now }
  gameStatesByKey.set(key, state)
  return state
}

/** 僅在明確設定 NEXT_PUBLIC_GAMES_ROOM_MOCK=true 時使用 mock；預設一律連接真實 Supabase（命名避開 use 前綴以免被誤判為 React Hook） */
export function getMockStore(): boolean {
  return process.env.NEXT_PUBLIC_GAMES_ROOM_MOCK === 'true'
}
