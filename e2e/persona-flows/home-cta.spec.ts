/**
 * 首頁 CTA 與導航 - Persona 驅動 E2E
 * 100 Persona 中採樣執行（fullFlow 子集 + 首頁導航輕量）
 */
import { test, expect } from '@playwright/test'
import {
  getFullFlowPersonas,
  getLightPersonas,
  getViewportForDevice,
} from '../fixtures/persona'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3099'

async function setAgeVerified(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    { name: 'cheersin_age_verified', value: '1', url: BASE },
  ])
}

const fullFlowPersonas = getFullFlowPersonas()
const lightPersonas = getLightPersonas().slice(0, 10) // 首頁+導航輕量採樣 10 個

test.describe('首頁 CTA 與導航', () => {
  for (const persona of [...fullFlowPersonas.slice(0, 10), ...lightPersonas]) {
    test(`${persona.name} (${persona.device}) - 首頁載入與 CTA 可見`, async ({
      page,
    }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/')
      await setAgeVerified(page)
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 })
      await expect(page).toHaveTitle(/Cheersin|靈魂之酒|酒類/i, { timeout: 10000 })

      // 主 CTA 首屏可見（多個連結可能匹配，取 first）；開始檢測 / 開始靈魂酒測
      const ctaQuiz = page.getByRole('link', { name: /開始檢測|開始靈魂酒測/ }).first()
      await expect(ctaQuiz).toBeVisible({ timeout: 15000 })
      await expect(ctaQuiz).toHaveAttribute('href', '/quiz')

      const ctaAssistant = page.getByRole('link', { name: /AI 侍酒師|AI 侍酒師諮詢/ }).first()
      await expect(ctaAssistant).toBeVisible({ timeout: 5000 })
      await expect(ctaAssistant).toHaveAttribute('href', '/assistant')
    })

    test(`${persona.name} (${persona.device}) - 導航連結可達`, async ({
      page,
    }) => {
      const viewport = getViewportForDevice(persona.device)
      await page.setViewportSize(viewport)

      await page.goto('/')
      await setAgeVerified(page)
      await page.goto('/')

      const navLinks = [
        { name: /首頁/, href: '/' },
        { name: /靈魂酒測/, href: '/quiz' },
        { name: /派對遊樂場|派對|遊戲/, href: '/games' },
        { name: /AI 侍酒師|侍酒師/, href: '/assistant' },
        { name: /品酒學院|學院|學習/, href: '/learn' },
      ]

      for (const { name, href } of navLinks) {
        const link = page.getByRole('link', { name }).first()
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', href)
      }
    })
  }

  test('點擊開始檢測可導向 quiz', async ({ page }) => {
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/')
    await page.getByRole('link', { name: /開始檢測/ }).first().click()
    await expect(page).toHaveURL(/\/quiz/)
  })

  test('點擊 AI 侍酒師可導向 assistant', async ({ page }) => {
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/')
    await page.getByRole('link', { name: /AI 侍酒師諮詢/ }).first().click()
    await expect(page).toHaveURL(/\/assistant/)
  })
})
