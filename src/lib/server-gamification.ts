/**
 * P1-43: Server-side gamification validation
 * Validates gamification data (points, streaks, badges) before persisting to DB.
 * Prevents client-side manipulation of scores and achievements.
 */

import type { BadgeId } from './gamification'
import { BADGE_LABELS, getSommelierLevel } from './gamification'

/** Maximum allowed points per single action to prevent abuse */
const MAX_POINTS_PER_ACTION = 100

/** Maximum total daily points to prevent farming */
const MAX_DAILY_POINTS = 500

/** Valid point-earning actions and their expected rewards */
export const POINT_ACTIONS = {
  complete_chapter: 10,
  complete_course: 50,
  complete_quiz: 5,
  daily_streak_bonus: 5,
  first_tasting_note: 10,
  share_note: 5,
} as const

export type PointAction = keyof typeof POINT_ACTIONS

/**
 * Validate that a point award is legitimate
 * @param action - The action being rewarded
 * @param points - Points being awarded
 * @returns Whether the award is valid
 */
export function validatePointAward(
  action: string,
  points: number
): { valid: boolean; expectedPoints: number; reason?: string } {
  if (!Number.isFinite(points) || points <= 0) {
    return { valid: false, expectedPoints: 0, reason: 'Points must be a positive finite number' }
  }

  if (points > MAX_POINTS_PER_ACTION) {
    return { valid: false, expectedPoints: 0, reason: `Points exceed maximum per action (${MAX_POINTS_PER_ACTION})` }
  }

  const expected = POINT_ACTIONS[action as PointAction]
  if (expected === undefined) {
    return { valid: false, expectedPoints: 0, reason: `Unknown action: ${action}` }
  }

  if (points !== expected) {
    return { valid: false, expectedPoints: expected, reason: `Expected ${expected} points for ${action}, got ${points}` }
  }

  return { valid: true, expectedPoints: expected }
}

/**
 * Validate badge unlock eligibility
 * Returns whether the badge can be legitimately unlocked
 */
export function validateBadgeUnlock(
  badgeId: string,
  context: {
    completedCourses?: number
    quizStreak?: number
    gamesPlayed?: number
    learnMinutes?: number
    bookmarks?: number
    assistantChats?: number
    wishlistCount?: number
  }
): { eligible: boolean; reason?: string } {
  // Check if it's a valid badge ID
  if (!(badgeId in BADGE_LABELS)) {
    return { eligible: false, reason: `Unknown badge: ${badgeId}` }
  }

  const id = badgeId as BadgeId

  switch (id) {
    case 'first-quiz':
      return { eligible: true } // Always eligible after first quiz
    case 'streak-7':
      return { eligible: true } // Validated by streak tracking
    case 'games-10':
      return { eligible: (context.gamesPlayed ?? 0) >= 10, reason: 'Need 10+ games played' }
    case 'learn-1':
      return { eligible: (context.completedCourses ?? 0) >= 1, reason: 'Need 1+ completed course' }
    case 'wishlist-5':
      return { eligible: (context.wishlistCount ?? 0) >= 5, reason: 'Need 5+ wishlist items' }
    case 'assistant-10':
      return { eligible: (context.assistantChats ?? 0) >= 10, reason: 'Need 10+ assistant chats' }
    case 'bookmark-5':
      return { eligible: (context.bookmarks ?? 0) >= 5, reason: 'Need 5+ bookmarks' }
    case 'bookmark-10':
      return { eligible: (context.bookmarks ?? 0) >= 10, reason: 'Need 10+ bookmarks' }
    case 'learn-60':
      return { eligible: (context.learnMinutes ?? 0) >= 60, reason: 'Need 60+ learn minutes' }
    case 'learn-120':
      return { eligible: (context.learnMinutes ?? 0) >= 120, reason: 'Need 120+ learn minutes' }
    case 'learn-300':
      return { eligible: (context.learnMinutes ?? 0) >= 300, reason: 'Need 300+ learn minutes' }
    case 'holiday-cny': {
      const d = new Date()
      const m = d.getMonth() + 1
      const day = d.getDate()
      const inRange = (m === 1 && day >= 22) || (m === 2 && day <= 15)
      return { eligible: inRange, reason: 'Only available during CNY period' }
    }
    case 'course-complete':
      return { eligible: (context.completedCourses ?? 0) >= 1, reason: 'Need 1+ completed course' }
    case 'trivia-streak-5':
      return { eligible: (context.quizStreak ?? 0) >= 5, reason: 'Need 5+ consecutive correct answers' }
  }
}

/**
 * Validate streak data consistency
 */
export function validateStreak(
  lastDate: string,
  claimedDays: number
): { valid: boolean; correctedDays: number } {
  if (claimedDays < 0 || !Number.isFinite(claimedDays)) {
    return { valid: false, correctedDays: 0 }
  }

  if (claimedDays > 365) {
    return { valid: false, correctedDays: 365 }
  }

  if (!lastDate) {
    return { valid: claimedDays === 0, correctedDays: 0 }
  }

  const last = new Date(lastDate)
  if (isNaN(last.getTime())) {
    return { valid: false, correctedDays: 0 }
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const diffMs = today.getTime() - last.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  // If more than 1 day gap, streak should be reset
  if (diffDays > 1) {
    return { valid: claimedDays <= 1, correctedDays: diffDays === 0 ? claimedDays : 1 }
  }

  return { valid: true, correctedDays: claimedDays }
}

/**
 * Validate sommelier level claim
 */
export function validateSommelierLevel(
  claimedLevel: string | null,
  completedCourses: number
): { valid: boolean; correctLevel: string | null } {
  const correctLevel = getSommelierLevel(completedCourses)
  return { valid: claimedLevel === correctLevel, correctLevel }
}
