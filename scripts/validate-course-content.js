#!/usr/bin/env node
/**
 * 98-100 課程內容驗證：字數、測驗邏輯、簡介對應
 * 執行：node scripts/validate-course-content.js
 */
const fs = require('fs')
const path = require('path')

const base = path.join(process.cwd(), 'data', 'courses')
const ids = fs.readdirSync(base).filter((f) => f.endsWith('.json') && f !== 'index.json')

let hasError = false
const report = { wordCount: [], quiz: [], intro: [], typo: [], imageAlt: [] }

/** 99 錯別字掃描；481 擴充；484 重複字/標點檢查 */
const TYPO_PATTERNS = [
  { re: /的的|了了|是是|在在|和和|或或|與與/g, msg: '重複字' },
  { re: /。\s*。/g, msg: '重複句號' },
  { re: /，\s*，/g, msg: '重複逗號' },
  { re: /！\s*！|？\s*？/g, msg: '重複標點' },
  { re: /\s{3,}/g, msg: '多餘空格' },
]

for (const file of ids) {
  const filePath = path.join(base, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const { title, description, chapters } = data

  for (const ch of chapters || []) {
    const len = (ch.content || '').replace(/\s/g, '').length
    report.wordCount.push({ course: data.id, ch: ch.id, len })
  }

  for (const ch of chapters || []) {
    for (const q of ch.quiz || []) {
      const ok = Array.isArray(q.options) && q.correctIndex >= 0 && q.correctIndex < q.options.length
      if (!ok) {
        report.quiz.push({ course: data.id, ch: ch.id, question: q.question?.slice(0, 30) })
        hasError = true
      }
    }
  }

  const descLen = (description || '').length
  if (descLen < 8) {
    report.intro.push({ course: data.id, len: descLen })
    hasError = true
  }

  for (const ch of chapters || []) {
    const text = (ch.content || '') + (ch.title || '')
    for (const { re, msg } of TYPO_PATTERNS) {
      if (re.test(text)) {
        report.typo.push({ course: data.id, ch: ch.id, msg })
        hasError = true
      }
    }
    /** 477 imageAlt 審查：有圖無 alt 或 alt 過短（僅報告，不阻擋） */
    if (ch.imageUrl && (!ch.imageAlt || (ch.imageAlt || '').trim().length < 3)) {
      report.imageAlt.push({ course: data.id, ch: ch.id, msg: ch.imageAlt ? 'alt 過短' : '缺少 imageAlt' })
    }
  }
}

const wordCounts = report.wordCount.map((w) => w.len).filter((x) => x > 0)
const avg = wordCounts.length ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0
const min = Math.min(...wordCounts, 9999)
const max = Math.max(...wordCounts, 0)
console.log(`章節字數：平均 ${avg} 字，範圍 ${min}-${max}`)
if (report.quiz.length) console.log('測驗邏輯錯誤：', report.quiz)
if (report.intro.length) console.log('簡介過短：', report.intro)
if (report.typo.length) console.log('可疑錯別字：', report.typo)
if (report.imageAlt.length) console.log('圖片 alt 問題：', report.imageAlt)
console.log(hasError ? '❌ 發現問題' : '✅ 內容驗證通過')
