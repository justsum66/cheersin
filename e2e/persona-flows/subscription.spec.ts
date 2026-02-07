/**
 * 訂閱與定價 - Persona 驅動 E2E
 */
import { test, expect } from '@playwright/test'
import { getFullFlowPersonas, getViewportForDevice } from '../fixtures/persona'

const personas = getFullFlowPersonas()
  .filter((p) => p.expectedFlows.some((f) => f.includes('subscription') || f.includes('pricing')))
  .slice(0, 6)
const fallback = getFullFlowPersonas().slice(0, 3)
const testPersonas = personas.length > 0 ? personas : fallback

test.describe('訂閱與定價', () => {
  for (const persona of testPersonas) {
    test(`${persona.name} - 可進入 pricing`, async ({ page }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/pricing')
      await expect(page).toHaveURL(/\/pricing/)

      await expect(
        page.getByText(/方案|訂閱|價格|免費|付費|NT\$|月|年/i)
      ).toBeVisible({ timeout: 10000 })
    })
  }

  test('pricing 頁面有訂閱方案', async ({ page }) => {
    await page.goto('/pricing')
    const pricingContent = page.getByText(/標準|進階|免費|付費|月費|年費/i)
    await expect(pricingContent).toBeVisible({ timeout: 5000 })
  })

  test('subscription 頁面可達', async ({ page }) => {
    await page.goto('/subscription')
    await expect(page).toHaveURL(/\/subscription/)
  })
})
