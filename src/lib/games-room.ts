/**
 * 遊戲房間工具函數
 * 提供房間查詢、密碼處理等功能
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * 房間 Slug 正則表達式
 * 允許小寫字母、數字和連字符，長度 3-20
 */
export const SLUG_PATTERN = /^[a-z0-9-]{3,20}$/

/**
 * 根據 Slug 查詢房間
 */
export async function getRoomBySlug<T = { id: string }>(
  supabase: SupabaseClient,
  slug: string,
  select: string = 'id'
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('game_rooms')
      .select(select)
      .eq('slug', slug)
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as T, error: null }
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Unknown error') 
    }
  }
}

/**
 * 雜湊房間密碼
 * 使用 SHA-256 進行雜湊
 */
export function hashRoomPassword(password: string): string {
  if (!password) return ''
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')
}

/**
 * 安全比較密碼雜湊值
 * 使用 timingSafeEqual 防止時序攻擊
 */
export function secureComparePasswordHash(hash1: string, hash2: string): boolean {
  if (!hash1 || !hash2) return false
  if (hash1.length !== hash2.length) return false
  
  try {
    const buf1 = Buffer.from(hash1, 'utf8')
    const buf2 = Buffer.from(hash2, 'utf8')
    return crypto.timingSafeEqual(buf1, buf2)
  } catch {
    return false
  }
}

/**
 * 生成房間 Slug
 */
export function generateRoomSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)]
  }
  return slug
}

/**
 * 驗證房間 Slug 格式
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

/**
 * 房間狀態類型
 */
export type RoomStatus = 'waiting' | 'playing' | 'paused' | 'finished'

/**
 * 房間配置介面
 */
export interface RoomSettings {
  max_players?: number
  is_private?: boolean
  password_protected?: boolean
  game_mode?: string
  time_limit?: number
}

/**
 * 房間完整資料介面
 */
export interface GameRoom {
  id: string
  slug: string
  name: string
  host_id: string
  status: RoomStatus
  settings: RoomSettings | null
  password_hash: string | null
  created_at: string
  updated_at: string
}

/**
 * 玩家資料介面
 */
export interface RoomPlayer {
  id: string
  room_id: string
  user_id: string | null
  display_name: string
  is_host: boolean
  is_spectator: boolean
  is_ready: boolean
  score: number
  joined_at: string
}

/**
 * 檢查用戶是否為房主
 */
export async function isRoomHost(
  supabase: SupabaseClient,
  roomId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('game_rooms')
    .select('host_id')
    .eq('id', roomId)
    .single()

  return data?.host_id === userId
}

/**
 * 獲取房間玩家數量
 */
export async function getRoomPlayerCount(
  supabase: SupabaseClient,
  roomId: string,
  excludeSpectators: boolean = true
): Promise<number> {
  let query = supabase
    .from('game_room_players')
    .select('id', { count: 'exact' })
    .eq('room_id', roomId)

  if (excludeSpectators) {
    query = query.eq('is_spectator', false)
  }

  const { count } = await query

  return count || 0
}

/**
 * 更新房間狀態
 */
export async function updateRoomStatus(
  supabase: SupabaseClient,
  roomId: string,
  status: RoomStatus
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('game_rooms')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', roomId)

  if (error) {
    return { success: false, error: new Error(error.message) }
  }

  return { success: true, error: null }
}
