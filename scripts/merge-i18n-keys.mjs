#!/usr/bin/env node
/**
 * I18N-002：將 defaultLocale (zh-TW) 中存在的 key 合併到目標 locale，僅補齊缺失 key，不覆寫既有值
 * 用法：node scripts/merge-i18n-keys.mjs [locale]
 * 例：node scripts/merge-i18n-keys.mjs zh-CN
 * 未傳 locale 時預設 zh-CN
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const messagesDir = path.join(__dirname, '..', 'messages')
const defaultLocale = 'zh-TW'
const targetLocale = process.argv[2] || 'zh-CN'

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

function setByPath(obj, pathKey, value) {
  const parts = pathKey.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}
    cur = cur[k]
  }
  cur[parts[parts.length - 1]] = value
}

const refPath = path.join(messagesDir, `${defaultLocale}.json`)
const targetPath = path.join(messagesDir, `${targetLocale}.json`)
const ref = JSON.parse(fs.readFileSync(refPath, 'utf8'))
const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
const allKeys = flattenKeys(ref)
let added = 0
for (const key of allKeys) {
  if (getByPath(target, key) === undefined) {
    setByPath(target, key, getByPath(ref, key))
    added++
  }
}
fs.writeFileSync(targetPath, JSON.stringify(target, null, 0) + '\n', 'utf8')
console.log(`[${targetLocale}] 已補齊 ${added} 個 key（來源：${defaultLocale}）`)
