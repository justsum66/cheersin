import { useCallback, useState } from 'react'
import { usePersistentStorage } from '../../../hooks/usePersistentStorage'
import { LEARN_PROGRESS_KEY } from '../../../config/learn.config'

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

/**
 * Hook for managing course learning progress
 * @param courseId - The course identifier
 * @param totalChapters - Total number of chapters in the course
 */
export function useLearnProgress(
  courseId: string,
  totalChapters: number
): UseLearnProgressReturn {
  // Migrate to usePersistentStorage with validation
  const [progress, setProgress] = usePersistentStorage<Record<string, ProgressEntry>>(
    LEARN_PROGRESS_KEY,
    {},
    {
      validate: (data): data is Record<string, ProgressEntry> => {
        if (typeof data !== 'object' || data === null) return false
        return Object.values(data).every(entry => 
          entry && 
          typeof entry === 'object' && 
          'completed' in entry && 
          'total' in entry &&
          typeof (entry as ProgressEntry).completed === 'number' &&
          typeof (entry as ProgressEntry).total === 'number'
        )
      },
      fallbackValue: {}
    }
  )
  
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)

  const current = progress[courseId]
  const completedCount = current ? Math.min(current.completed, totalChapters) : 0
  const progressPct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0

  // Update progress with auto-save indicator
  const updateProgress = useCallback((entry: ProgressEntry) => {
    setAutoSaveIndicator(true)
    setProgress(prev => ({
      ...prev,
      [courseId]: entry
    }))
    
    // Hide indicator after delay
    setTimeout(() => setAutoSaveIndicator(false), 1500)
  }, [courseId, setProgress])

  return {
    progress,
    completedCount,
    progressPct,
    updateProgress,
    autoSaveIndicator: true // Always true with auto-save
  }
}