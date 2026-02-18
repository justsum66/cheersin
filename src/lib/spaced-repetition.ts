/**
 * LEARN-017: SM-2 based spaced repetition algorithm
 * Calculates next review date based on user performance rating
 */

export interface SrsCard {
  id: string
  /** Number of consecutive correct recalls */
  repetitions: number
  /** Easiness factor (>= 1.3) */
  easeFactor: number
  /** Interval in days until next review */
  interval: number
  /** Next review date as ISO string */
  nextReview: string
  /** Last rating */
  lastRating?: 'easy' | 'hard' | 'again'
}

export type SrsRating = 'easy' | 'hard' | 'again'

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

const RATING_QUALITY: Record<SrsRating, number> = {
  easy: 5,
  hard: 3,
  again: 0,
}

/**
 * Create a new SRS card with default values
 */
export function createSrsCard(id: string): SrsCard {
  return {
    id,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    nextReview: new Date().toISOString(),
  }
}

/**
 * SM-2 algorithm: Calculate next review parameters based on rating
 */
export function reviewCard(card: SrsCard, rating: SrsRating): SrsCard {
  const q = RATING_QUALITY[rating]

  let { repetitions, easeFactor, interval } = card

  if (q < 3) {
    // Failed: reset to beginning
    repetitions = 0
    interval = 1
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Update easiness factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    id: card.id,
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    nextReview: nextReview.toISOString(),
    lastRating: rating,
  }
}

/**
 * Check if a card is due for review
 */
export function isDue(card: SrsCard): boolean {
  return new Date(card.nextReview) <= new Date()
}

/**
 * Get cards due for review, sorted by overdue time (most overdue first)
 */
export function getDueCards(cards: SrsCard[]): SrsCard[] {
  const now = new Date()
  return cards
    .filter(c => new Date(c.nextReview) <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
}

/**
 * Get review stats for a deck
 */
export function getDeckStats(cards: SrsCard[]) {
  const now = new Date()
  const due = cards.filter(c => new Date(c.nextReview) <= now).length
  const learning = cards.filter(c => c.repetitions > 0 && c.repetitions < 3).length
  const mature = cards.filter(c => c.repetitions >= 3).length
  const newCards = cards.filter(c => c.repetitions === 0).length

  return {
    total: cards.length,
    due,
    learning,
    mature,
    newCards,
    averageEase: cards.length > 0
      ? Math.round(cards.reduce((sum, c) => sum + c.easeFactor, 0) / cards.length * 100) / 100
      : DEFAULT_EASE_FACTOR,
  }
}

// ------ localStorage persistence ------

const SRS_STORAGE_KEY = 'cheersin_srs_cards'

/** Load SRS cards from localStorage */
export function loadSrsCards(): SrsCard[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SrsCard[]
  } catch {
    return []
  }
}

/** Save SRS cards to localStorage */
export function saveSrsCards(cards: SrsCard[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(cards))
  } catch {
    /* quota exceeded — ignore */
  }
}

/** Update or insert a card in the deck */
export function upsertSrsCard(cards: SrsCard[], updated: SrsCard): SrsCard[] {
  const idx = cards.findIndex(c => c.id === updated.id)
  if (idx >= 0) {
    const next = [...cards]
    next[idx] = updated
    return next
  }
  return [...cards, updated]
}
