#!/usr/bin/env node
/**
 * 全站 i18n 計畫 Part A：機器翻譯 messages
 * 從 zh-TW 或 en 翻譯至 ja/ko/yue，保留 {{placeholder}} 不譯。
 * 需設定 GOOGLE_TRANSLATE_API_KEY（Google Cloud Translation API v2）。
 * 用法：node scripts/translate-messages.mjs --source=zh-TW --target=ja [--dry-run]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const messagesDir = path.join(__dirname, '..', 'messages')

const PLACEHOLDER_PREFIX = '__PH_'
const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g
const BATCH_SIZE = 50
const DELAY_MS = 250

function parseArgs() {
  const args = process.argv.slice(2)
  let source = 'zh-TW'
  let target = ''
  let dryRun = false
  for (const a of args) {
    if (a.startsWith('--source=')) source = a.split('=')[1].trim()
    else if (a.startsWith('--target=')) target = a.split('=')[1].trim()
    else if (a === '--dry-run') dryRun = true
  }
  return { source, target, dryRun }
}

/** 收集所有字串葉節點 path + value */
function collectStrings(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      collectStrings(v, key, out)
    } else if (typeof v === 'string') {
      out.push({ path: key, value: v })
    }
  }
  return out
}

/** 將 {{key}} 替換為 __PH_0__ 等，回傳 { text, placeholders[] } */
function maskPlaceholders(str) {
  const placeholders = []
  const text = str.replace(PLACEHOLDER_REGEX, (_, key) => {
    const idx = placeholders.length
    placeholders.push(`{{${key}}}`)
    return `${PLACEHOLDER_PREFIX}${idx}__`
  })
  return { text, placeholders }
}

function unmaskPlaceholders(text, placeholders) {
  let out = text
  placeholders.forEach((ph, i) => {
    out = out.replace(new RegExp(`${PLACEHOLDER_PREFIX}${i}__`, 'g'), ph)
  })
  return out
}

/** Google Cloud Translation API v2 */
async function translateBatchGoogle(texts, sourceLang, targetLang, apiKey) {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Translation API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.data.translations.map((t) => t.translatedText)
}

/** LibreTranslate fallback (single text per request when no batch) */
const LIBRE_SOURCE = { 'zh-TW': 'zh', en: 'en' }
const LIBRE_TARGET = { ja: 'ja', ko: 'ko', yue: 'zh' }

async function translateBatchLibre(texts, sourceLang, targetLang, baseUrl, apiKey) {
  const src = LIBRE_SOURCE[sourceLang] || sourceLang
  const tgt = LIBRE_TARGET[targetLang] || targetLang
  const out = []
  const body = (q) => ({ q, source: src, target: tgt, format: 'text', ...(apiKey && { api_key: apiKey }) })
  for (const text of texts) {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body(text)),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`LibreTranslate error ${res.status}: ${err}`)
    }
    const data = await res.json()
    out.push(data.translatedText || text)
    await sleep(150)
  }
  return out
}

/** 來源/目標語對應 API 的 language code */
const SOURCE_MAP = { 'zh-TW': 'zh-TW', en: 'en' }
const TARGET_MAP = { ja: 'ja', ko: 'ko', yue: 'yue' }

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
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

async function main() {
  const { source, target, dryRun } = parseArgs()
  if (!target || !['ja', 'ko', 'yue'].includes(target)) {
    console.error('Usage: node scripts/translate-messages.mjs --source=zh-TW|en --target=ja|ko|yue [--dry-run]')
    process.exit(1)
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  const libreUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com'
  const libreKey = process.env.LIBRETRANSLATE_API_KEY
  const useGoogle = Boolean(apiKey)
  if (!dryRun && !useGoogle && !libreKey) {
    console.error('Set GOOGLE_TRANSLATE_API_KEY or LIBRETRANSLATE_API_KEY to run translation. See docs/i18n-guide.md.')
    process.exit(1)
  }
  if (!dryRun && !useGoogle) {
    console.log('[translate] Using LibreTranslate at', libreUrl)
  }

  const sourcePath = path.join(messagesDir, `${source}.json`)
  const targetPath = path.join(messagesDir, `${target}.json`)
  const sourceObj = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
  const targetObj = JSON.parse(fs.readFileSync(targetPath, 'utf8'))

  const entries = collectStrings(sourceObj)
  const sourceLang = SOURCE_MAP[source] || source
  const targetLang = TARGET_MAP[target] || target

  if (dryRun) {
    console.log(`[dry-run] Would translate ${entries.length} strings from ${source} to ${target}`)
    return
  }

  const masked = entries.map((e) => {
    const { text, placeholders } = maskPlaceholders(e.value)
    return { path: e.path, placeholders, text }
  })

  const translated = []
  const batchLen = useGoogle ? BATCH_SIZE : 1
  for (let i = 0; i < masked.length; i += batchLen) {
    const batch = masked.slice(i, i + batchLen)
    const texts = batch.map((b) => b.text)
    const results = useGoogle
      ? await translateBatchGoogle(texts, sourceLang, targetLang, apiKey)
      : await translateBatchLibre(texts, sourceLang, targetLang, libreUrl, libreKey)
    batch.forEach((b, j) => {
      translated.push({ path: b.path, value: unmaskPlaceholders(results[j] || b.text, b.placeholders) })
    })
    if (i + batchLen < masked.length) await sleep(DELAY_MS)
  }

  translated.forEach(({ path: p, value }) => setByPath(targetObj, p, value))
  fs.writeFileSync(targetPath, JSON.stringify(targetObj, null, 0) + '\n', 'utf8')
  console.log(`[${target}] Translated ${translated.length} strings from ${source} -> ${targetPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
