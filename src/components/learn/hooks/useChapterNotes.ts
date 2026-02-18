import { useState, useEffect, useCallback } from 'react'
import { getNote, setNote } from '@/lib/learn-notes'

interface Chapter {
  id: number
  title: string
}

interface UseChapterNotesReturn {
  notes: Record<number, string>
  setChapterNote: (chapterId: number, text: string) => void
  noteSaveIndicator: Record<number, boolean>
}

/**
 * Hook for managing chapter notes with auto-save functionality
 * @param courseId - The course identifier
 * @param chapters - Array of chapters
 */
export function useChapterNotes(
  courseId: string,
  chapters: Chapter[]
): UseChapterNotesReturn {
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [noteSaveIndicator, setNoteSaveIndicator] = useState<Record<number, boolean>>({})

  // Load notes from localStorage on mount
  useEffect(() => {
    const initial: Record<number, string> = {}
    chapters.forEach((ch) => {
      initial[ch.id] = getNote(courseId, ch.id)
    })
    setNotes(initial)
  }, [courseId, chapters])

  // Save note with visual indicator
  const setChapterNote = useCallback((chapterId: number, text: string) => {
    // Show save indicator
    setNoteSaveIndicator(prev => ({ ...prev, [chapterId]: true }))

    // Persist to localStorage
    setNote(courseId, chapterId, text)
    setNotes(prev => ({ ...prev, [chapterId]: text }))

    // Hide indicator after delay
    setTimeout(() => {
      setNoteSaveIndicator(prev => ({ ...prev, [chapterId]: false }))
    }, 1000)
  }, [courseId])

  return {
    notes,
    setChapterNote,
    noteSaveIndicator
  }
}
