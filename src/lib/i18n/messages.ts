/**
 * 六語系訊息 — 由 messages/*.json 匯入，供 I18nProvider 使用
 */
import zhTW from '../../../messages/zh-TW.json'
import zhCN from '../../../messages/zh-CN.json'
import yue from '../../../messages/yue.json'
import en from '../../../messages/en.json'
import ja from '../../../messages/ja.json'
import ko from '../../../messages/ko.json'
import type { Locale } from './config'

export type Messages = typeof zhTW

/**
 * 各語系 JSON 可能尚未完全同步 zh-TW 的所有 key（增量翻譯中），
 * 因此透過 unknown 過渡型別斷言。I18nProvider 的 t() 會在 key 缺失時
 * 自動 fallback 到 zh-TW 值，確保運行時不會顯示 undefined。
 */
export const messages: Record<Locale, Messages> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN as unknown as Messages,
  'yue': yue as unknown as Messages,
  'en': en as unknown as Messages,
  'ja': ja as unknown as Messages,
  'ko': ko as unknown as Messages,
}
