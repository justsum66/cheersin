/**
 * GP-008: In-app review prompt hook
 * Triggers review prompt after positive game session, respecting frequency limits.
 */

import { useCallback } from 'react'
import { IN_APP_REVIEW_CONFIG } from '@/config/twa.config'

interface ReviewState {
  promptCount: number
  lastPromptAt: number
  installDate: number
  gamesPlayed: number
}

const STORAGE_KEY = IN_APP_REVIEW_CONFIG.storageKey

function getReviewState(): ReviewState {
  if (typeof window === 'undefined') {
    return { promptCount: 0, lastPromptAt: 0, installDate: Date.now(), gamesPlayed: 0 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ReviewState
  } catch { /* ignore */ }
  const state: ReviewState = { promptCount: 0, lastPromptAt: 0, installDate: Date.now(), gamesPlayed: 0 }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  return state
}

function saveReviewState(state: ReviewState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

/** Check if conditions are met to show review prompt */
function shouldShowReviewPrompt(state: ReviewState): boolean {
  const now = Date.now()
  const daysSinceInstall = (now - state.installDate) / (1000 * 60 * 60 * 24)
  const daysSinceLastPrompt = state.lastPromptAt ? (now - state.lastPromptAt) / (1000 * 60 * 60 * 24) : Infinity

  if (state.gamesPlayed < IN_APP_REVIEW_CONFIG.minGamesPlayed) return false
  if (daysSinceInstall < IN_APP_REVIEW_CONFIG.minDaysSinceInstall) return false
  if (state.promptCount >= IN_APP_REVIEW_CONFIG.maxPromptsPerUser) return false
  if (daysSinceLastPrompt < IN_APP_REVIEW_CONFIG.daysBetweenPrompts) return false

  return true
}

/** Hook for in-app review prompt */
export function useInAppReview() {
  /** Record a completed game session */
  const recordGamePlayed = useCallback(() => {
    const state = getReviewState()
    state.gamesPlayed += 1
    saveReviewState(state)
  }, [])

  /** Check and trigger review prompt if eligible */
  const maybePromptReview = useCallback((): boolean => {
    const state = getReviewState()

    if (!shouldShowReviewPrompt(state)) return false

    // Mark prompt as shown
    state.promptCount += 1
    state.lastPromptAt = Date.now()
    saveReviewState(state)

    return true
  }, [])

  /** Get current review state for debugging */
  const getState = useCallback(() => getReviewState(), [])

  return { recordGamePlayed, maybePromptReview, getState }
}
