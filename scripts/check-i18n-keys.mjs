#!/usr/bin/env node
/**
 * I18N-13 / TEST-008：檢查各語系是否缺少 defaultLocale (zh-TW) 的 key
 * 用法：node scripts/check-i18n-keys.mjs [--full]
 * 預設只檢查關鍵命名空間（meta, common, error, notFound, apiErrors, gameError, gamesError, nav），--full 時檢查全部
 * 若某 locale 缺少 key 則印出並 exit(1)，CI 可於 build 前執行
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const messagesDir = path.join(__dirname, '..', 'messages')
const defaultLocale = 'zh-TW'

/** TEST-008：關鍵命名空間，僅這些缺失時才 exit(1)；其餘 key 由 I18N-002 另批補齊 */
const CRITICAL_PREFIXES = ['meta', 'common', 'error', 'notFound', 'apiErrors', 'gameError', 'gamesError', 'nav']

function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, key))
    } else {
      keys.push(key)
    }
  }
  return keys
}

function getByPath(obj, pathKey) {
  let cur = obj
  for (const k of pathKey.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[k]
  }
  return cur
}

const fullCheck = process.argv.includes('--full')
const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'))
const locales = files.map((f) => path.basename(f, '.json'))

const refPath = path.join(messagesDir, `${defaultLocale}.json`)
const ref = JSON.parse(fs.readFileSync(refPath, 'utf8'))
const allKeys = flattenKeys(ref)
const requiredKeys = fullCheck
  ? allKeys
  : allKeys.filter((k) => CRITICAL_PREFIXES.some((p) => k === p || k.startsWith(p + '.')))

let hasError = false
for (const loc of locales) {
  if (loc === defaultLocale) continue
  const filePath = path.join(messagesDir, `${loc}.json`)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const missing = requiredKeys.filter((key) => getByPath(data, key) === undefined)
  if (missing.length > 0) {
    console.error(`[${loc}] 缺少 ${missing.length} 個 key:`, missing.slice(0, 20).join(', '), missing.length > 20 ? `... 等共 ${missing.length} 個` : '')
    hasError = true
  }
}

if (hasError) process.exit(1)
console.log('i18n keys check OK: all locales have keys from', defaultLocale)
