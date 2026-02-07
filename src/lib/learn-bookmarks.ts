/**
 * 156–160 學習書籤：課程章節書籤列表存於 localStorage
 */
const KEY = 'cheersin_learn_bookmarks'
const MAX_BOOKMARKS = 50

export interface LearnBookmark {
  courseId: string
  chapterId: number
  title: string
  courseTitle?: string
  addedAt: number
}

export function getBookmarks(): LearnBookmark[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as LearnBookmark[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** 20 書籤上限 50；回傳是否成功加入 */
export function addBookmark(b: Omit<LearnBookmark, 'addedAt'>): { ok: boolean; atLimit?: boolean } {
  if (typeof window === 'undefined') return { ok: false }
  const list = getBookmarks()
  if (list.some((x) => x.courseId === b.courseId && x.chapterId === b.chapterId)) return { ok: false }
  if (list.length >= MAX_BOOKMARKS) return { ok: false, atLimit: true }
  try {
    localStorage.setItem(KEY, JSON.stringify([...list, { ...b, addedAt: Date.now() }]))
    return { ok: true, atLimit: list.length + 1 >= MAX_BOOKMARKS }
  } catch {
    return { ok: false }
  }
}

export function getBookmarkLimit(): number {
  return MAX_BOOKMARKS
}

export function removeBookmark(courseId: string, chapterId: number): void {
  if (typeof window === 'undefined') return
  try {
    const list = getBookmarks().filter((x) => !(x.courseId === courseId && x.chapterId === chapterId))
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export function hasBookmark(courseId: string, chapterId: number): boolean {
  return getBookmarks().some((x) => x.courseId === courseId && x.chapterId === chapterId)
}
