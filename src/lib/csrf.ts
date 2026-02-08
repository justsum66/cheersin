/**
 * P2-335：CSRF 雙重提交 Cookie — 產生與驗證 token，供 middleware 與表單使用
 * 不依賴 session：cookie 存 token，請求頭 X-CSRF-Token 與其一致即視為同源意圖
 */

const COOKIE_NAME = 'csrf-token'
const HEADER_NAME = 'X-CSRF-Token'
const TOKEN_BYTES = 32

/** 產生隨機 token（hex） */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export { COOKIE_NAME as CSRF_COOKIE_NAME, HEADER_NAME as CSRF_HEADER_NAME }
