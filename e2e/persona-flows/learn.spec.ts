/**
 * 品酒學院 - Persona 驅動 E2E；LEARN_100 擴充
 */
import { test, expect } from '@playwright/test'
import { getFullFlowPersonas, getViewportForDevice } from '../fixtures/persona'

const personas = getFullFlowPersonas().slice(0, 8)

test.describe('品酒學院', () => {
  for (const persona of personas) {
    test(`${persona.name} - 可進入 learn 並看到課程`, async ({ page }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/learn')
      await expect(page).toHaveURL(/\/learn/)

      await expect(
        page.getByText(/葡萄酒|威士忌|啤酒|清酒|課程|入門|學習|5 分鐘|快懂/i)
      ).toBeVisible({ timeout: 10000 })
    })
  }

  test('課程卡片可點擊進入', async ({ page }) => {
    await page.goto('/learn')
    const courseLink = page.getByRole('link', { name: /葡萄酒|威士忌|啤酒|清酒|入門|5 分鐘/i }).first()
    if (await courseLink.isVisible()) {
      await courseLink.click()
      await expect(page).toHaveURL(/\/(learn|learn\/)/)
    }
  })

  test('快速課程篩選按鈕可切換', async ({ page }) => {
    await page.goto('/learn')
    const quickBtn = page.getByRole('button', { name: /10 分鐘|快速/i })
    if (await quickBtn.isVisible()) {
      await quickBtn.click()
      await expect(page.getByText(/共 \d+ 門課程/)).toBeVisible()
    }
  })

  test('認證篩選按鈕存在', async ({ page }) => {
    await page.goto('/learn')
    await expect(page.getByRole('button', { name: /認證|WSET|CMS|MW/i }).first()).toBeVisible({ timeout: 5000 })
  })

  test('學習路徑提示區塊可見', async ({ page }) => {
    await page.goto('/learn')
    await expect(page.getByText(/建議學習路徑|入門.*進階.*專家/i)).toBeVisible()
  })
})
