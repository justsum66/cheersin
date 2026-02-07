/**
 * 靈魂酒測流程 - Persona 驅動 E2E
 * fullFlow Persona 子集執行
 */
import { test, expect } from '@playwright/test'
import { getFullFlowPersonas, getViewportForDevice } from '../fixtures/persona'

const personas = getFullFlowPersonas().slice(0, 8)

test.describe('靈魂酒測流程', () => {
  for (const persona of personas) {
    test(`${persona.name} - 可進入測驗並完成生日選擇`, async ({ page }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/quiz')
      await expect(page).toHaveURL(/\/quiz/)

      // 應有星座或生日相關介面
      await expect(
        page.getByText(/星座|生日|牡羊|金牛|雙子|巨蟹|獅子|處女|天秤|天蠍|射手|摩羯|水瓶|雙魚/i)
      ).toBeVisible({ timeout: 10000 })

      // 點選一個星座或進入下一步
      const firstZodiac = page.getByRole('button', { name: /牡羊|金牛|雙子|選擇|下一步/i }).first()
      if (await firstZodiac.isVisible()) {
        await firstZodiac.click()
      }
    })
  }

  test('quiz 頁面有 h1', async ({ page }) => {
    await page.goto('/quiz')
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })
})
