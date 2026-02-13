/**
 * T121 P1：關鍵流程 axe 無障礙檢驗
 * 首頁、Quiz、登入、定價、Games Lobby 跑 axe-core，斷言無 critical 違規。
 * 執行：npm run test:e2e -- e2e/a11y.spec.ts
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/** TEST-015 / A11Y-013：關鍵頁 axe 無 critical；含 learn、party-room、subscription */
const CRITICAL_PAGES = [
  { path: '/', name: '首頁' },
  { path: '/quiz', name: 'Quiz' },
  { path: '/login', name: '登入' },
  { path: '/pricing', name: '定價' },
  { path: '/games', name: 'Games Lobby' },
  { path: '/learn', name: '品酒學院' },
  { path: '/party-room', name: '派對房' },
  { path: '/subscription', name: '訂閱' },
]

test.describe('axe 無障礙：關鍵頁面無 critical 違規', () => {
  for (const { path, name } of CRITICAL_PAGES) {
    test(`${name} (${path}) 無 critical 違規`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      // 年齡門檻僅在 /games 出現，其餘頁面不處理
      if (path.startsWith('/games')) {
        const ageConfirm = page.getByRole('button', { name: /我滿 18|滿 18|確認|已滿/ })
        if (await ageConfirm.isVisible().catch(() => false)) {
          await ageConfirm.click()
          await page.waitForTimeout(500)
        }
      }

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const critical = results.violations.filter((v) => v.impact === 'critical')
      expect(
        critical,
        `頁面 ${name} 不應有 critical 違規。違規：${JSON.stringify(critical, null, 2)}`
      ).toHaveLength(0)
    })
  }
})

test.describe('axe 無障礙：首頁與 Quiz 無 serious 違規', () => {
  test('首頁無 serious 違規', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious')
    expect(serious, `首頁 serious 違規：${JSON.stringify(serious.map((s) => ({ id: s.id, help: s.help })))}`).toHaveLength(0)
  })

  test('Quiz 頁無 serious 違規（intro 狀態）', async ({ page }) => {
    await page.goto('/quiz')
    await page.getByRole('button', { name: /開始檢測|開始靈魂酒測/ }).waitFor({ state: 'visible', timeout: 8000 })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious')
    expect(serious, `Quiz serious 違規：${JSON.stringify(serious.map((s) => ({ id: s.id, help: s.help })))}`).toHaveLength(0)
  })
})
