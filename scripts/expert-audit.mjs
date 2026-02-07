#!/usr/bin/env node
/**
 * 專家審查自動化腳本
 * 使用 @axe-core/playwright 做 A11y 掃描 + 自訂規則（h1、CTA、觸控區域等）
 * 執行前需：npm run dev 已啟動，或設定 BASE_URL
 * 用法：node scripts/expert-audit.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE_URL = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000'

const PAGES = [
  { path: '/', name: '首頁' },
  { path: '/quiz', name: '靈魂酒測' },
  { path: '/games', name: '派對遊樂場' },
  { path: '/assistant', name: 'AI 侍酒師' },
  { path: '/learn', name: '品酒學院' },
  { path: '/pricing', name: '定價' },
]

/** 自訂規則檢查 */
async function runCustomChecks(page, path, name) {
  const results = []
  const url = BASE_URL + path
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })

  // h1 唯一
  const h1Count = await page.locator('h1').count()
  results.push({
    id: 'singleH1',
    rule: 'singleH1',
    text: '每頁僅一個 h1',
    passed: h1Count === 1,
    detail: `h1 數量: ${h1Count}`,
  })

  // viewport meta
  const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
  results.push({
    id: 'viewportMeta',
    rule: 'viewportMeta',
    text: 'viewport meta 正確',
    passed: !!viewport && viewport.includes('width'),
    detail: viewport || '無',
  })

  // 主 CTA 存在（首頁）
  if (path === '/') {
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('a[href="/quiz"]', { timeout: 10000 }).catch(() => null)
    await new Promise((r) => setTimeout(r, 500))
    const ctaQuiz = await page.getByRole('link', { name: /開始檢測/ }).count()
    results.push({
      id: 'ctaAboveFold',
      rule: 'ctaAboveFold',
      text: '主 CTA 首屏可見',
      passed: ctaQuiz > 0,
      detail: `開始檢測連結: ${ctaQuiz}`,
    })
  }

  // 觸控區域：主 CTA + 導航 + 大按鈕（Lobby min-h-[48px]）；需至少 2 個 ≥44px
  const prioritySelector = 'a[href="/quiz"], a[href="/assistant"], a[href="/games"], button[class*="min-h-"], button.btn-primary, button.btn-secondary, a[class*="btn-primary"]'
  const buttons = await page.locator(prioritySelector).all()
  let touchOk = 0
  const touchTotal = Math.min(buttons.length, 6)
  for (let i = 0; i < touchTotal && i < buttons.length; i++) {
    const box = await buttons[i].boundingBox()
    if (box && box.width >= 44 && box.height >= 44) touchOk++
  }
  const minRequired = touchTotal <= 2 ? 1 : 2
  results.push({
    id: 'minTouchTarget',
    rule: 'minTouchTarget',
    text: '觸控區域 ≥44px（抽樣）',
    passed: touchTotal === 0 || touchOk >= minRequired,
    detail: `${touchOk}/${touchTotal} 符合`,
  })

  return results
}

/** axe 無障礙掃描 */
async function runAxeScan(page, path, name) {
  const url = BASE_URL + path
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
  const results = await new AxeBuilder({ page }).analyze()
  const violations = results.violations || []
  const passed = violations.length === 0
  return {
    id: 'axe',
    rule: 'axe',
    text: 'axe 無障礙掃描',
    passed,
    detail: `${violations.length} 違規`,
    violations: violations.slice(0, 5).map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
  }
}

async function main() {
  const startTime = Date.now()
  const expertResults = []
  const allCustomChecks = []

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()

  try {
    for (const { path, name } of PAGES) {
      try {
        const customChecks = await runCustomChecks(page, path, name)
        allCustomChecks.push({ path, name, checks: customChecks })

        if (path === '/' || path === '/quiz') {
          const axeResult = await runAxeScan(page, path, name)
          expertResults.push({ path, name, axe: axeResult })
        }
      } catch (err) {
        allCustomChecks.push({
          path,
          name,
          error: err.message,
          checks: [],
        })
      }
    }
  } finally {
    await browser.close()
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  const totalChecks = allCustomChecks.flatMap((p) => p.checks || [])
  const passedChecks = totalChecks.filter((c) => c.passed).length
  const score = totalChecks.length > 0 ? Math.round((passedChecks / totalChecks.length) * 100) : 0

  const report = {
    meta: {
      date: new Date().toISOString().slice(0, 10),
      duration: `${duration}s`,
      baseUrl: BASE_URL,
    },
    summary: {
      totalChecks: totalChecks.length,
      passed: passedChecks,
      failed: totalChecks.length - passedChecks,
      score,
    },
    pageResults: allCustomChecks,
    axeResults: expertResults,
    criticalIssues: totalChecks.filter((c) => !c.passed && (c.rule === 'axe' || c.rule === 'singleH1')).map((c) => c.text),
  }

  const fs = await import('fs')
  const pathMod = await import('path')
  const dir = pathMod.join(process.cwd(), 'test-reports')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const outPath = pathMod.join(dir, 'expert-audit-report.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`Expert audit done. Score: ${score}%. Report: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
