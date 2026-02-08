/**
 * P2-358：防止 Open Redirect — 僅允許站內或白名單 host
 */

const ALLOWED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'cheersin.app',
  process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
].filter(Boolean) as string[])

/**
 * 檢查 URL 是否為站內或白名單 host，避免釣魚跳轉
 */
export function isSafeRedirectUrl(url: string, origin?: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url, origin ?? 'https://cheersin.app')
    const host = parsed.hostname.toLowerCase()
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    if (ALLOWED_HOSTS.has(host)) return true
    if (origin) {
      const originHost = new URL(origin).hostname.toLowerCase()
      if (host === originHost) return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * 解析 next 參數並限制為站內路徑白名單（與 login 一致）
 */
export const ALLOWED_NEXT_PATHS = /^\/(profile|quiz|assistant|games|learn|pricing|subscription)(\?|$)/

export function getSafeNextPath(next: string | null): string {
  if (!next || typeof next !== 'string') return '/profile'
  const path = next.startsWith('/') ? next : `/${next}`
  return ALLOWED_NEXT_PATHS.test(path) ? path : '/profile'
}
