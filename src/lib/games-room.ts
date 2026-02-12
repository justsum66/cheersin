import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Game room slug generator (short, URL-safe).
 * Uses alphanumeric lowercase for readability.
 * P3-59：slug 驗證 — 僅允許 [a-z0-9]，長度 1–20
 */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const SLUG_LEN = 8
/** P3-59：API 接受之 slug 格式（路徑參數驗證用） */
export const SLUG_PATTERN = /^[a-z0-9]{1,20}$/
const PASSWORD_HASH_HEX_LEN = 64

/** A1-12 / SEC-013：房間密碼僅存 hash，不明文；4 位數密碼 hash 供建立/加入房間驗證，固定 64 字元 hex */
export function hashRoomPassword(password: string): string {
  return createHash('sha256').update(password, 'utf8').digest('hex')
}

/** P0-08：常數時間比較兩個 64 字元 hex hash，防時序攻擊 */
export function secureComparePasswordHash(providedHash: string, storedHash: string): boolean {
  const a = providedHash.slice(0, PASSWORD_HASH_HEX_LEN).padEnd(PASSWORD_HASH_HEX_LEN, '0')
  const b = storedHash.slice(0, PASSWORD_HASH_HEX_LEN).padEnd(PASSWORD_HASH_HEX_LEN, '0')
  const bufA = Buffer.from(a, 'hex')
  const bufB = Buffer.from(b, 'hex')
  if (bufA.length !== 32 || bufB.length !== 32) return false
  return timingSafeEqual(bufA, bufB)
}

export function generateShortSlug(): string {
  let s = ''
  let bytes: Uint8Array | number[]
  try {
    const nodeCrypto = require('node:crypto')
    bytes = Array.from(nodeCrypto.randomBytes(SLUG_LEN))
  } catch {
    bytes = Array.from({ length: SLUG_LEN }, () => Math.floor(Math.random() * 256))
  }
  for (let i = 0; i < SLUG_LEN; i++) {
    s += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return s
}

export interface GameRoomRow {
  id: string
  slug: string
  created_at: string
  expires_at: string | null
}

export interface GameRoomPlayerRow {
  id: string
  room_id: string
  display_name: string
  order_index: number
  joined_at: string
}
