/**
 * UA-030: User feedback collection system
 * Hook and utilities for collecting in-app feedback after key moments.
 */

import { useCallback, useState } from 'react'

const FEEDBACK_STORAGE_KEY = 'cheersin-feedback-state'
const FEEDBACK_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface FeedbackState {
  lastPromptAt: number
  promptCount: number
  feedbackGiven: boolean
}

function getFeedbackState(): FeedbackState {
  if (typeof window === 'undefined') return { lastPromptAt: 0, promptCount: 0, feedbackGiven: false }
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as FeedbackState
  } catch { /* ignore */ }
  return { lastPromptAt: 0, promptCount: 0, feedbackGiven: false }
}

function saveFeedbackState(state: FeedbackState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

export type FeedbackType = 'nps' | 'feature_request' | 'bug_report' | 'general'

export interface FeedbackPayload {
  type: FeedbackType
  rating?: number // 1-10 for NPS, 1-5 for satisfaction
  text?: string
  context?: string // page or feature being reviewed
}

/** Hook for collecting user feedback */
export function useFeedback() {
  const [showPrompt, setShowPrompt] = useState(false)

  /** Check if we should show feedback prompt */
  const shouldPrompt = useCallback((): boolean => {
    const state = getFeedbackState()
    if (state.feedbackGiven) return false
    if (state.promptCount >= 3) return false
    if (Date.now() - state.lastPromptAt < FEEDBACK_COOLDOWN_MS) return false
    return true
  }, [])

  /** Trigger feedback prompt if eligible */
  const triggerPrompt = useCallback(() => {
    if (shouldPrompt()) {
      setShowPrompt(true)
      const state = getFeedbackState()
      state.lastPromptAt = Date.now()
      state.promptCount += 1
      saveFeedbackState(state)
    }
  }, [shouldPrompt])

  /** Submit feedback to analytics API */
  const submitFeedback = useCallback(async (payload: FeedbackPayload) => {
    const state = getFeedbackState()
    state.feedbackGiven = true
    saveFeedbackState(state)
    setShowPrompt(false)

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `feedback_${payload.type}`,
          value: payload.rating ?? 0,
          id: payload.context ?? 'general',
          metadata: payload.text?.slice(0, 500),
        }),
      })
    } catch { /* non-critical */ }
  }, [])

  /** Dismiss without submitting */
  const dismissPrompt = useCallback(() => {
    setShowPrompt(false)
  }, [])

  return { showPrompt, triggerPrompt, submitFeedback, dismissPrompt, shouldPrompt }
}
