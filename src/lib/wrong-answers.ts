/**
 * Phase 2 C2.2: 錯題本功能
 * 收集使用者答錯的測驗題目，支援回顧與複習
 */

const WRONG_ANSWERS_KEY = 'cheersin_wrong_answers'
const MAX_WRONG_ANSWERS = 100 // 最多保存 100 道錯題

export interface WrongAnswer {
  courseId: string
  courseTitle: string
  chapterId: number
  chapterTitle: string
  question: string
  options: string[]
  correctIndex: number
  userAnswer: number
  explanation?: string
  timestamp: number
  reviewed: boolean
}

/**
 * 從 localStorage 載入錯題本
 */
export function loadWrongAnswers(): WrongAnswer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WRONG_ANSWERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as WrongAnswer[]
  } catch {
    return []
  }
}

/**
 * 保存錯題本到 localStorage
 */
function saveWrongAnswers(answers: WrongAnswer[]): void {
  if (typeof window === 'undefined') return
  try {
    // 保持最多 MAX_WRONG_ANSWERS 道錯題，優先保留未複習的
    const sorted = [...answers].sort((a, b) => {
      if (a.reviewed !== b.reviewed) return a.reviewed ? 1 : -1
      return b.timestamp - a.timestamp
    })
    const trimmed = sorted.slice(0, MAX_WRONG_ANSWERS)
    localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(trimmed))
  } catch {
    /* ignore */
  }
}

/**
 * 新增一道錯題
 */
export function addWrongAnswer(answer: Omit<WrongAnswer, 'timestamp' | 'reviewed'>): void {
  const current = loadWrongAnswers()
  
  // 檢查是否已存在相同題目（避免重複）
  const exists = current.some(
    a => a.courseId === answer.courseId && 
         a.chapterId === answer.chapterId && 
         a.question === answer.question
  )
  
  if (exists) {
    // 更新時間戳，不重複加入
    const updated = current.map(a => 
      a.courseId === answer.courseId && 
      a.chapterId === answer.chapterId && 
      a.question === answer.question
        ? { ...a, timestamp: Date.now(), userAnswer: answer.userAnswer, reviewed: false }
        : a
    )
    saveWrongAnswers(updated)
  } else {
    const newAnswer: WrongAnswer = {
      ...answer,
      timestamp: Date.now(),
      reviewed: false,
    }
    saveWrongAnswers([newAnswer, ...current])
  }
}

/**
 * 將錯題標記為已複習
 */
export function markAsReviewed(courseId: string, chapterId: number, question: string): void {
  const current = loadWrongAnswers()
  const updated = current.map(a =>
    a.courseId === courseId && a.chapterId === chapterId && a.question === question
      ? { ...a, reviewed: true }
      : a
  )
  saveWrongAnswers(updated)
}

/**
 * 移除一道錯題（答對後）
 */
export function removeWrongAnswer(courseId: string, chapterId: number, question: string): void {
  const current = loadWrongAnswers()
  const filtered = current.filter(
    a => !(a.courseId === courseId && a.chapterId === chapterId && a.question === question)
  )
  saveWrongAnswers(filtered)
}

/**
 * 清空所有錯題
 */
export function clearAllWrongAnswers(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WRONG_ANSWERS_KEY)
  }
}

/**
 * 取得未複習的錯題數量
 */
export function getUnreviewedCount(): number {
  return loadWrongAnswers().filter(a => !a.reviewed).length
}

/**
 * 取得特定課程的錯題
 */
export function getWrongAnswersByCourse(courseId: string): WrongAnswer[] {
  return loadWrongAnswers().filter(a => a.courseId === courseId)
}

/**
 * 取得錯題統計
 */
export function getWrongAnswersStats(): {
  total: number
  unreviewed: number
  byCourse: Record<string, number>
} {
  const answers = loadWrongAnswers()
  const byCourse: Record<string, number> = {}
  
  answers.forEach(a => {
    byCourse[a.courseId] = (byCourse[a.courseId] || 0) + 1
  })
  
  return {
    total: answers.length,
    unreviewed: answers.filter(a => !a.reviewed).length,
    byCourse,
  }
}
