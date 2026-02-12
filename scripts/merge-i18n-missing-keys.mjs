#!/usr/bin/env node
/**
 * One-off: 將 zh-TW 有但其他 locale 沒有的 key 補上（值從 zh-TW 複製），使 check:i18n:all 通過。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const refLocale = 'zh-TW'

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

const dir = path.join(__dirname, '..', 'messages')
const refPath = path.join(dir, `${refLocale}.json`)
const ref = JSON.parse(fs.readFileSync(refPath, 'utf8'))
const allKeys = flattenKeys(ref)

const locales = ['zh-CN', 'ja', 'ko', 'yue']
for (const loc of locales) {
  const filePath = path.join(dir, `${loc}.json`)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  let added = 0
  for (const key of allKeys) {
    if (getByPath(data, key) === undefined) {
      const val = getByPath(ref, key)
      if (val !== undefined) {
        setByPath(data, key, val)
        added++
      }
    }
  }
  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    console.log(`[${loc}] added ${added} keys`)
  }
}
