/**
 * P1-45: Server-side game state validation
 * Validates game state transitions to prevent cheating / invalid state manipulation.
 * Ensures game room operations follow proper state machine rules.
 */

export type GamePhase = 'lobby' | 'playing' | 'paused' | 'ended'

export interface GameRoomState {
  roomId: string
  phase: GamePhase
  playerCount: number
  maxPlayers: number
  createdAt: number
  hostId: string
}

/** Valid phase transitions */
const VALID_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  lobby: ['playing', 'ended'],     // lobby → start game or cancel
  playing: ['paused', 'ended'],    // playing → pause or end
  paused: ['playing', 'ended'],    // paused → resume or end
  ended: [],                        // ended is terminal
}

/**
 * Validate a game phase transition
 */
export function isValidTransition(
  from: GamePhase,
  to: GamePhase
): boolean {
  const allowed = VALID_TRANSITIONS[from]
  return allowed ? allowed.includes(to) : false
}

/**
 * Validate player count for a room
 */
export function validatePlayerCount(
  currentCount: number,
  maxPlayers: number,
  action: 'join' | 'leave'
): { valid: boolean; reason?: string } {
  if (action === 'join') {
    if (currentCount >= maxPlayers) {
      return { valid: false, reason: `Room is full (${maxPlayers} max)` }
    }
    return { valid: true }
  }

  if (action === 'leave') {
    if (currentCount <= 0) {
      return { valid: false, reason: 'Room is already empty' }
    }
    return { valid: true }
  }

  return { valid: false, reason: `Unknown action: ${action}` }
}

/**
 * Validate room creation parameters
 */
export function validateRoomCreation(params: {
  maxPlayers: number
  hostId: string
  gameType?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!params.hostId || typeof params.hostId !== 'string') {
    errors.push('Host ID is required')
  }

  if (!Number.isInteger(params.maxPlayers) || params.maxPlayers < 2 || params.maxPlayers > 12) {
    errors.push('maxPlayers must be between 2 and 12')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate that a user has permission to perform room actions
 */
export function validateRoomPermission(
  userId: string,
  hostId: string,
  action: 'start' | 'pause' | 'end' | 'kick'
): { allowed: boolean; reason?: string } {
  // Only host can control the game
  if (userId !== hostId) {
    return { allowed: false, reason: `Only the host can ${action} the game` }
  }
  return { allowed: true }
}

/**
 * Validate display name for joining a room
 */
export function validateDisplayName(name: string): {
  valid: boolean
  sanitized: string
  reason?: string
} {
  if (typeof name !== 'string') {
    return { valid: false, sanitized: '', reason: 'Display name must be a string' }
  }

  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', reason: 'Display name cannot be empty' }
  }

  if (trimmed.length > 20) {
    return { valid: false, sanitized: trimmed.slice(0, 20), reason: 'Display name too long (max 20 chars)' }
  }

  // Basic XSS prevention: strip HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '')

  return { valid: true, sanitized }
}
