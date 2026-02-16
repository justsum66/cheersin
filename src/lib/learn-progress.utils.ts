import { LEARN_PROGRESS_KEY, LEARN_QUIZ_PASSED_KEY } from '@/config/learn.config'

export type ProgressEntry = { completed: number; total: number; completedAt?: string }

/**
 * 從 localStorage 讀取課程進度
 */
export function loadProgress(): Record<string, ProgressEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LEARN_PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, ProgressEntry> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'completed' in v && 'total' in v) {
        out[k] = { completed: Number((v as ProgressEntry).completed), total: Number((v as ProgressEntry).total) }
        if (typeof (v as ProgressEntry).completedAt === 'string') out[k].completedAt = (v as ProgressEntry).completedAt
      }
    }
    return out
  } catch {
    return {}
  }
}

/**
 * 儲存課程進度到 localStorage
 */
export function saveProgress(progress: Record<string, ProgressEntry>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LEARN_PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
}

/**
 * 檢查章節測驗是否已通過
 */
export function getQuizPassed(courseId: string, chapterId: number): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(LEARN_QUIZ_PASSED_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Record<string, Record<string, boolean>>
    return !!parsed[courseId]?.[String(chapterId)]
  } catch {
    return false
  }
}

/**
 * 設定章節測驗為已通過
 */
export function setQuizPassed(courseId: string, chapterId: number): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LEARN_QUIZ_PASSED_KEY)
    const parsed = (raw ? JSON.parse(raw) : {}) as Record<string, Record<string, boolean>>
    if (!parsed[courseId]) parsed[courseId] = {}
    parsed[courseId][String(chapterId)] = true
    localStorage.setItem(LEARN_QUIZ_PASSED_KEY, JSON.stringify(parsed))
  } catch {
    /* ignore */
  }
}
