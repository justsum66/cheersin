import { useState, useEffect, useCallback } from 'react'
import { LEARN_PROGRESS_KEY } from '@/config/learn.config'

export interface ProgressEntry {
  completed: number
  total: number
  completedAt?: string
}

interface UseLearnProgressReturn {
  progress: Record<string, ProgressEntry>
  completedCount: number
  progressPct: number
  updateProgress: (entry: ProgressEntry) => void
  autoSaveIndicator: boolean
}

function loadProgress(): Record<string, ProgressEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LEARN_PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, ProgressEntry> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'completed' in v && 'total' in v) {
        out[k] = {
          completed: Number((v as ProgressEntry).completed),
          total: Number((v as ProgressEntry).total)
        }
        if (typeof (v as ProgressEntry).completedAt === 'string') {
          out[k].completedAt = (v as ProgressEntry).completedAt
        }
      }
    }
    return out
  } catch {
    return {}
  }
}

function saveProgress(progress: Record<string, ProgressEntry>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LEARN_PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
}

/**
 * Hook for managing course learning progress
 * @param courseId - The course identifier
 * @param totalChapters - Total number of chapters in the course
 */
export function useLearnProgress(
  courseId: string,
  totalChapters: number
): UseLearnProgressReturn {
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({})
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)

  // Load progress from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  const current = progress[courseId]
  const completedCount = current ? Math.min(current.completed, totalChapters) : 0
  const progressPct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0

  // Update progress with auto-save indicator
  const updateProgress = useCallback((entry: ProgressEntry) => {
    setAutoSaveIndicator(true)
    const next = { ...progress, [courseId]: entry }
    setProgress(next)
    saveProgress(next)
    
    // Hide indicator after delay
    setTimeout(() => setAutoSaveIndicator(false), 1500)
  }, [courseId, progress])

  return {
    progress,
    completedCount,
    progressPct,
    updateProgress,
    autoSaveIndicator
  }
}
