#!/usr/bin/env node
/**
 * 瀏覽器操作檢查腳本（模擬 MCP cursor-ide-browser 流程）
 * 執行 navigate → snapshot 式檢查 → 關鍵點擊 → 產出 JSON 報告
 * 可於 Agent 模式以 MCP browser 手動執行後，或本腳本自動執行
 * 用法：node scripts/mcp-browser-check.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const BASE_URL = args[0] || process.env.BASE_URL || 'http://localhost:3000'
const QUICK = process.argv.includes('--quick') || process.env.QUICK

/** --quick 只跑前 2 個 flow 加快執行 */
const ALL_FLOWS = [
  {
    name: '首頁 → 開始檢測',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'check', selector: 'a[href="/quiz"]', text: /開始檢測/ },
      { action: 'click', selector: 'a[href="/quiz"]' },
      { action: 'checkUrl', pattern: /\/quiz/ },
    ],
  },
  {
    name: '首頁 → AI 侍酒師',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'check', selector: 'a[href="/assistant"]', text: /AI 侍酒師/ },
      { action: 'click', selector: 'a[href="/assistant"]' },
      { action: 'checkUrl', pattern: /\/assistant/ },
    ],
  },
  {
    name: '導航 → 派對遊樂場',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'check', selector: 'a[href="/games"]', text: /派對|遊戲/ },
      { action: 'click', selector: 'a[href="/games"]' },
      { action: 'checkUrl', pattern: /\/games/ },
      { action: 'check', selector: 'body', text: /猜你喜歡|真心話|大冒險|命運轉盤|遊戲|遊樂場/ },
    ],
  },
  {
    name: '導航 → 品酒學院',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'check', selector: 'a[href="/learn"]', text: /品酒學院|學院|學習/ },
      { action: 'click', selector: 'a[href="/learn"]' },
      { action: 'checkUrl', pattern: /\/learn/ },
    ],
  },
]
const FLOWS = QUICK ? ALL_FLOWS.slice(0, 2) : ALL_FLOWS

async function runFlow(page, flow) {
  const results = []
  for (const step of flow.steps) {
    try {
      if (step.action === 'navigate') {
        await page.goto(BASE_URL + step.url, { waitUntil: 'domcontentloaded', timeout: 10000 })
        results.push({ step: step.action, url: step.url, passed: true })
      } else if (step.action === 'check') {
        const el = page.locator(step.selector).first()
        await el.waitFor({ state: 'visible', timeout: 8000 })
        const text = step.text ? await el.textContent() : ''
        const matches = !step.text || step.text.test(text)
        results.push({ step: step.action, selector: step.selector, passed: matches })
      } else if (step.action === 'click') {
        await page.locator(step.selector).first().click({ timeout: 5000 })
        results.push({ step: step.action, selector: step.selector, passed: true })
      } else if (step.action === 'checkUrl') {
        const url = page.url()
        const passed = step.pattern.test(url)
        results.push({ step: step.action, url, pattern: step.pattern.toString(), passed })
      }
    } catch (err) {
      results.push({
        step: step.action,
        passed: false,
        error: err.message,
      })
    }
  }
  return results
}

async function main() {
  const startTime = Date.now()
  const flowResults = []

  const browser = await chromium.launch({ headless: true, timeout: 15000 })
  const context = await browser.newContext({
    viewport: { width: 393, height: 851 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  })
  const page = await context.newPage()
  page.setDefaultTimeout(6000)

  try {
    for (const flow of FLOWS) {
      const steps = await runFlow(page, flow)
      const passed = steps.every((s) => s.passed)
      flowResults.push({
        name: flow.name,
        passed,
        steps,
      })
    }
  } finally {
    await browser.close()
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  const report = {
    meta: {
      date: new Date().toISOString().slice(0, 10),
      duration: `${duration}s`,
      baseUrl: BASE_URL,
      device: 'mobile',
    },
    flowResults,
    summary: {
      total: flowResults.length,
      passed: flowResults.filter((f) => f.passed).length,
      failed: flowResults.filter((f) => !f.passed).length,
    },
  }

  const fs = await import('fs')
  const pathMod = await import('path')
  const dir = pathMod.join(process.cwd(), 'test-reports')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const outPath = pathMod.join(dir, 'mcp-browser-check-report.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`Browser check done. Report: ${outPath}`)
}

Promise.race([
  main(),
  new Promise((_, rej) => setTimeout(() => rej(new Error('mcp-browser-check timeout 25s')), 25000)),
]).catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
