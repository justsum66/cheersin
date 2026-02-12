/**
 * I18N-17：SSR 用 meta 文案 — 依 locale 回傳首頁 title/description，供 layout generateMetadata 使用
 */
import { messages } from '@/lib/i18n/messages'
import { defaultLocale, type Locale } from '@/lib/i18n/config'

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function getRootMeta(locale: Locale): {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
} {
  const fallback = messages[defaultLocale] as Record<string, unknown>
  const msg = (messages[locale] ?? fallback) as Record<string, unknown>
  return {
    title: getByPath(msg, 'meta.defaultTitle') ?? getByPath(fallback, 'meta.defaultTitle') ?? 'Cheersin | 探索你的靈魂之酒',
    description: getByPath(msg, 'meta.defaultDescription') ?? getByPath(fallback, 'meta.defaultDescription') ?? '',
    ogTitle: getByPath(msg, 'meta.ogTitle') ?? getByPath(fallback, 'meta.ogTitle') ?? 'Cheersin | 探索你的靈魂之酒',
    ogDescription: getByPath(msg, 'meta.ogDescription') ?? getByPath(fallback, 'meta.ogDescription') ?? '',
  }
}
