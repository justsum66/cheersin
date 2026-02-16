/**
 * 遊戲輸入清理工具
 */

/**
 * 移除 HTML 標籤
 */
export function stripHtml(input: string): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim()
}

/**
 * 清理並截斷文字
 */
export function sanitizeAndTruncate(input: string, maxLength: number = 100): string {
  const cleaned = stripHtml(input)
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength - 3) + '...'
}

/**
 * 移除危險字元
 */
export function removeDangerousChars(input: string): string {
  if (!input) return ''
  return input
    .replace(/[<>'"&\\]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

/**
 * 清理玩家名稱
 */
export function sanitizePlayerName(name: string, maxLength: number = 20): string {
  if (!name) return ''
  return stripHtml(name)
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * 清理房間名稱
 */
export function sanitizeRoomName(name: string, maxLength: number = 30): string {
  if (!name) return ''
  return stripHtml(name)
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * 驗證是否為安全的 URL
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * 轉義正則表達式特殊字元
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
