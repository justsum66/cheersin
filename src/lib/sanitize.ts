/**
 * P2-311：後端輸入清理 — 移除潛在惡意 HTML/腳本，防 XSS
 * 供 API 在寫入 DB 或回傳前清理用戶輸入
 *
 * SEC-006：dangerouslySetInnerHTML 政策
 * - 僅允許 type="application/ld+json" 且內容為 JSON.stringify(結構化物件) 的用法。
 * - 禁止將使用者輸入或 API 回傳的原始 HTML 寫入 dangerouslySetInnerHTML。
 * - 結構化資料請使用 SafeJsonLdScript 元件或同等 pattern（僅 object → JSON.stringify）。
 */

const BAD_TAGS = /<\/?(script|iframe|object|embed|form|input|button|textarea|style|link|meta|svg)[^>]*>/gi
const BAD_ATTRS = /\s(on\w+|formaction|action)\s*=\s*["']?[^"'\s]*/gi

/**
 * 輕量清理：移除危險標籤與事件屬性，不依賴 sanitize-html 以減少 bundle
 * 若需更嚴格清理，可引入 sanitize-html 並在此呼叫
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  return html
    .replace(BAD_TAGS, '')
    .replace(BAD_ATTRS, '')
    .trim()
}

/**
 * 純文字： strip 所有 HTML 標籤
 */
export function stripHtml(html: string): string {
  if (typeof html !== 'string') return ''
  return html.replace(/<[^>]+>/g, '').trim()
}
