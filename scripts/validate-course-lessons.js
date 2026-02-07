#!/usr/bin/env node
/**
 * 23 課程 lessons 與 JSON chapters 一致檢查
 * 執行：node scripts/validate-course-lessons.js
 */
const fs = require('fs')
const path = require('path')

const COURSE_LESSONS = {
  'wine-basics': 8, 'white-wine': 6, 'whisky-101': 6, 'sake-intro': 5, 'craft-beer': 6,
  'cocktail-basics': 6, 'champagne-sparkling': 5, 'rum-basics': 5, 'gin-basics': 5,
  'tequila-mezcal': 5, 'wine-advanced': 6, 'brandy-cognac': 5, 'cocktail-classics': 6,
  'wine-pairing': 5, 'sake-advanced': 5, 'whisky-single-malt': 6, 'natural-wine': 4,
  'low-abv': 4, 'tasting-notes': 5, 'home-bar': 5,
  'wset-l1-spirits': 5, 'wset-l2-wines': 6, 'wset-l3-viticulture': 5, 'wset-l3-tasting': 5,
  'wset-d1-production': 6, 'wset-d2-business': 5, 'wset-d3-world': 6, 'fortified-wines': 5,
  'cms-intro-somm': 5, 'cms-deductive-tasting': 5, 'cms-service': 5, 'cms-advanced-regions': 6,
  'mw-viticulture': 5, 'mw-vinification': 5, 'mw-business': 5, 'organic-biodynamic': 4,
  'wine-law-regions': 5, 'dessert-wines': 4, 'beer-cider': 5, 'somm-exam-prep': 5,
  'wset-d4-sparkling-pro': 5,
  'quick-wine-5min': 3,
  'quick-cocktail-5min': 3,
  'dating-wine-select': 3,
  'quick-whisky-5min': 3,
  'party-wine-select': 3,
  'home-sipping': 4,
  'wine-label-read': 4,
  'supermarket-wine': 4,
  'beginner-faq': 4,
  'bordeaux-deep': 5,
  'burgundy-deep': 5,
  'italy-deep': 5,
  'new-world-deep': 5,
  'blind-tasting-advanced': 5,
  'viral-trends-2025': 5,
}

const FILE_MAP = { 'wine-basics': 'wine-101' }
const base = path.join(process.cwd(), 'data', 'courses')
let hasError = false

for (const [id, expected] of Object.entries(COURSE_LESSONS)) {
  const file = (FILE_MAP[id] ?? id) + '.json'
  const filePath = path.join(base, file)
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ ${id}: JSON 不存在 ${file}`)
    hasError = true
    continue
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const actual = data.chapters?.length ?? 0
  if (actual !== expected) {
    console.error(`❌ ${id}: 期望 ${expected} 章，實際 ${actual} 章`)
    hasError = true
  }
}
if (!hasError) console.log('✅ 課程 lessons 與 JSON chapters 一致')
