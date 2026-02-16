/**
 * GAMES_500 #207：規則內容 markdown 或 HTML sanitize。
 * 僅保留純文字，移除所有標籤與 script/style 內容，避免 XSS。
 */
export function stripHtml(html: string): string {
  if (typeof html !== 'string' || !html.trim()) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
