/**
 * 156–160 學習筆記：依 courseId + chapterId 存於 localStorage
 */
const KEY = 'cheersin_learn_notes'

function key(courseId: string, chapterId: number): string {
  return `${courseId}_${chapterId}`
}

export function getNote(courseId: string, chapterId: number): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return ''
    const obj = JSON.parse(raw) as Record<string, string>
    return obj[key(courseId, chapterId)] ?? ''
  } catch {
    return ''
  }
}

export function setNote(courseId: string, chapterId: number, text: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(KEY)
    const obj = (raw ? JSON.parse(raw) : {}) as Record<string, string>
    obj[key(courseId, chapterId)] = text
    localStorage.setItem(KEY, JSON.stringify(obj))
  } catch {
    /* ignore */
  }
}
