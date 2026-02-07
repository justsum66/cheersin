#!/usr/bin/env node
/**
 * E92 P2：靈魂酒測題庫格式驗證（若題目為 JSON 時使用）
 * 目前題目在 src/app/quiz/page.tsx 內，本腳本驗證 data/quiz-questions.json 是否存在且格式正確。
 * 執行：node scripts/validate-quiz-questions.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '../data/quiz-questions.json')

if (!fs.existsSync(dataPath)) {
  console.log('ℹ data/quiz-questions.json 不存在；題目目前定義於 src/app/quiz/page.tsx，本腳本僅在匯出為 JSON 時使用。')
  console.log('  格式請見 docs/QUIZ_QUALITY_CHECK.md')
  process.exit(0)
}

let hasError = false
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
const questions = Array.isArray(data.questions) ? data.questions : data

questions.forEach((q, i) => {
  if (!q.id && q.id !== 0) {
    console.error(`❌ 題目 ${i}: 缺少 id`)
    hasError = true
  }
  if (!q.question || typeof q.question !== 'string') {
    console.error(`❌ 題目 ${i}: 缺少 question 或非字串`)
    hasError = true
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    console.error(`❌ 題目 ${i}: options 須為陣列且至少 2 項`)
    hasError = true
  } else {
    q.options.forEach((opt, j) => {
      if (!opt.id || !opt.text || !opt.trait) {
        console.error(`❌ 題目 ${i} 選項 ${j}: 缺少 id / text / trait`)
        hasError = true
      }
    })
  }
})

if (!hasError) console.log('✅ 題庫格式驗證通過')
process.exit(hasError ? 1 : 0)
