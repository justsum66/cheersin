/**
 * AI 侍酒師 - Persona 驅動 E2E
 */
import { test, expect } from '@playwright/test'
import { getFullFlowPersonas, getViewportForDevice } from '../fixtures/persona'

const personas = getFullFlowPersonas().slice(0, 8)

test.describe('AI 侍酒師', () => {
  for (const persona of personas) {
    test(`${persona.name} - 可進入 assistant 並看到輸入區`, async ({ page }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/assistant')
      await expect(page).toHaveURL(/\/assistant/)

      // 應有輸入框或快捷問題
      const inputOrPrompt = page.getByRole('textbox').or(page.getByRole('button', { name: /推薦|問題|輸入/i }))
      await expect(inputOrPrompt.first()).toBeVisible({ timeout: 10000 })
    })
  }

  test('assistant 頁面有標題', async ({ page }) => {
    await page.goto('/assistant')
    await expect(page.getByRole('heading', { name: /AI 侍酒師/ })).toBeVisible({ timeout: 10000 })
  })
})
