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

export const messages: Record<Locale, Messages> = {
  'zh-TW': zhTW as Messages,
  'zh-CN': zhCN as Messages,
  'yue': yue as Messages,
  'en': en as Messages,
  'ja': ja as Messages,
  'ko': ko as Messages,
}
