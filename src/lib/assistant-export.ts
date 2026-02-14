/**
 * AST-37：複製/分享/匯出內容淨化 — strip 控制字元、截斷長度，避免問題內容
 */

const CONTROL_AND_NULL = /[\x00-\x1F\x7F]/g
const DEFAULT_MAX_LENGTH = 50_000

/**
 * 淨化用於複製、分享或匯出的文字：移除控制字元、可選截斷長度
 */
export function sanitizeForExport(text: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  if (typeof text !== 'string') return ''
  const stripped = text.replace(CONTROL_AND_NULL, '').trim()
  return stripped.length > maxLength ? stripped.slice(0, maxLength) : stripped
}
