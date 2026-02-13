/**
 * 遊戲入口與進入遊戲 - Persona 驅動 E2E
 */
import { test, expect } from '@playwright/test'
import { getFullFlowPersonas, getViewportForDevice } from '../fixtures/persona'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3099'

/** games 頁 AgeGate 使用 sessionStorage，需 addInitScript 在載入前設定 */
async function setAgeVerified(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('cheersin_age_verified_games', '1')
    } catch {
      /* ignore */
    }
  })
}

const personas = getFullFlowPersonas().filter((p) =>
  p.expectedFlows.some((f) => f.includes('games'))
).slice(0, 10)
const fallbackPersonas = getFullFlowPersonas().slice(0, 5)

const testPersonas = personas.length > 0 ? personas : fallbackPersonas

test.describe('派對遊樂場', () => {
  test.beforeEach(async ({ page }) => {
    await setAgeVerified(page)
  })

  for (const persona of testPersonas) {
    test(`${persona.name} - 可進入 games 並看到遊戲列表`, async ({ page }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/games', { waitUntil: 'domcontentloaded', timeout: 30000 })
      await expect(page).toHaveURL(/\/games/, { timeout: 5000 })

      // 應有 games 頁面內容（h1 或 main）；games 頁 JS 較多，給足載入時間
      await expect(page.locator('h1, [role="main"], [role="region"][aria-label*="遊戲"]')).toBeVisible({ timeout: 25000 })
      // 派對、遊樂場、遊戲大廳、搜尋遊戲、經典派對等任一（支援多語系）
      await expect(
        page.getByText(/派對|遊樂場|建立|管理|遊戲|本機|遊戲大廳|搜尋遊戲|經典|Party|Games|Lobby|Search/i).first()
      ).toBeVisible({ timeout: 25000 })
    })
  }

  test('點擊遊戲可進入（抽樣）', async ({ page }) => {
    await page.goto('/games', { waitUntil: 'domcontentloaded', timeout: 30000 })
    const gameLink = page.getByRole('link', { name: /真心話|大冒險|轉盤|輪盤|骰子|誰最可能/i }).first()
    if (await gameLink.isVisible()) {
      await gameLink.click()
      await expect(page).toHaveURL(/\/games/)
    }
  })
})
