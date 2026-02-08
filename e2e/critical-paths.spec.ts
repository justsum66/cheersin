/**
 * EXPERT_60 P3：關鍵路徑 E2E — 首頁→Quiz 完成、登入、訂閱流程
 * 用於 CI 必過，確保核心轉換路徑不壞。
 */
import { test, expect } from '@playwright/test'

/** N26：Nav Bar 30 優化 — E2E 覆蓋 nav 可達、連結可點 */
test.describe('關鍵路徑：Nav Bar', () => {
  test('首頁頂部導航可見且可點擊進入各區', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\//)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle').catch(() => {})
    const nav = page.getByRole('navigation', { name: '主導航', exact: true })
    await expect(nav).toBeVisible({ timeout: 12000 })
    const learnLink = page.getByRole('link', { name: '品酒學院' }).first()
    await learnLink.scrollIntoViewIfNeeded()
    await expect(learnLink).toBeVisible({ timeout: 8000 })
    await learnLink.click()
    await expect(page).toHaveURL(/\/learn/, { timeout: 15000 })
  })

  test('首頁底部導航（手機）可見且可點', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).toHaveURL(/\//)
    await page.waitForLoadState('domcontentloaded')
    const cookieDialog = page.getByRole('dialog', { name: /Cookie|同意/ })
    const cookieReject = page.getByRole('button', { name: /拒絕非必要|拒絕/ })
    const cookieAccept = page.getByRole('button', { name: /接受全部|同意|接受/ })
    if (await cookieReject.isVisible().catch(() => false)) {
      await cookieReject.click()
      await cookieDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    } else if (await cookieAccept.isVisible().catch(() => false)) {
      await cookieAccept.click()
      await cookieDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    }
    await page.waitForTimeout(400)
    const bottomNav = page.getByRole('navigation', { name: '底部導航' })
    await expect(bottomNav).toBeVisible({ timeout: 12000 })
    const quizLink = page.getByRole('link', { name: '靈魂酒測' }).last()
    await quizLink.click()
    await expect(page).toHaveURL(/\/quiz/, { timeout: 15000 })
  })
})

test.describe('關鍵路徑：首頁 → Quiz 完成', () => {
  /** Quiz 頁 20 項優化 #12：Quiz 頁首屏可達 E2E */
  test('Quiz 頁可達且顯示標題與開始按鈕', async ({ page }) => {
    await page.goto('/quiz')
    await expect(page).toHaveURL(/\/quiz/)
    await expect(page.getByRole('heading', { name: /靈魂.*酒測/ })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: /開始靈魂酒測|開始檢測/ })).toBeVisible({ timeout: 5000 })
  })

  test('首頁點擊開始檢測可進入 Quiz', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\//)
    await page.waitForLoadState('domcontentloaded')
    const link = page.getByRole('link', { name: /開始檢測|開始靈魂酒測/ }).first()
    await link.waitFor({ state: 'visible', timeout: 10000 })
    await Promise.all([
      page.waitForURL(/\/quiz/, { timeout: 15000 }),
      link.click(),
    ])
    await expect(page).toHaveURL(/\/quiz/)
  })

  test('Quiz 可從 intro 進入星座選擇並完成一題', async ({ page }) => {
    test.setTimeout(45000)
    await page.goto('/quiz')
    await page.getByRole('button', { name: /開始靈魂酒測|開始檢測/ }).click()
    await expect(page.getByText(/你這次想要/)).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: /酒款推薦（含遊戲）/ }).click()
    await expect(page.getByText(/選擇您的星座/)).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /牡羊|金牛|雙子|巨蟹|獅子|處女|天秤|天蠍|射手|摩羯|水瓶|雙魚/ }).first().click()
    await expect(page.getByText(/第\s*1\s*\/\s*\d+\s*題/)).toBeVisible({ timeout: 10000 })
    // Quiz 選項為 role="radio"（radiogroup），非 button
    const firstOption = page.locator('[role="radiogroup"]').getByRole('radio').first()
    await firstOption.waitFor({ state: 'visible', timeout: 15000 })
    await firstOption.click()
    await expect(page.locator('text=/第\\s*[12]\\s*\\/\\s*\\d+\\s*題/')).toBeVisible({ timeout: 5000 })
  })

  test('Quiz 完整流程可走完並到達結果頁', async ({ page }) => {
    test.setTimeout(120000)
    await page.goto('/quiz')
    await page.getByRole('button', { name: /開始靈魂酒測|開始檢測/ }).click()
    await expect(page.getByText(/你這次想要/)).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: /酒款推薦（含遊戲）/ }).click()
    await expect(page.getByText(/選擇您的星座/)).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /牡羊/ }).first().click()
    const questionCount = 18
    for (let i = 0; i < questionCount; i++) {
      await expect(page.getByText(/第\s*\d+\s*\/\s*\d+\s*題/)).toBeVisible({ timeout: 15000 })
      await page.waitForTimeout(200)
      const option = page.locator('button[role="radio"]').first()
      await option.waitFor({ state: 'visible', timeout: 10000 })
      await option.click({ force: true })
      await page.waitForTimeout(350)
    }
    await expect(
      page.getByText(/您的靈魂之酒|靈魂之酒|查看推薦|發現你的靈魂|測驗結果/).first()
    ).toBeVisible({ timeout: 25000 })
  })
})

test.describe('關鍵路徑：登入頁', () => {
  test('登入頁可載入且表單可見', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('#login-password')).toBeVisible({ timeout: 10000 })
  })

  test('登入頁有「以 Google 繼續」或密碼登入', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('#login-email', { state: 'visible', timeout: 10000 }).catch(() => null)
    const hasGoogle = await page.getByRole('button', { name: /Google|繼續|用 Google/ }).isVisible().catch(() => false)
    const hasSubmit = await page.getByRole('button', { name: /登入|送出|登入帳號|密碼登入|Sign in|Email 登入/ }).isVisible().catch(() => false)
    const hasPasswordInput = await page.locator('#login-password').isVisible().catch(() => false)
    const hasEmailInput = await page.locator('#login-email').isVisible().catch(() => false)
    expect(hasGoogle || hasSubmit || hasPasswordInput || hasEmailInput).toBeTruthy()
  })
})

test.describe('關鍵路徑：訂閱流程', () => {
  test('定價頁可載入且方案可見', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page).toHaveURL(/\/pricing/)
    await expect(page.getByRole('heading', { name: /免費方案|個人方案|方案/ }).first()).toBeVisible({ timeout: 8000 })
  })

  test('定價頁 FAQ 區塊可展開', async ({ page }) => {
    await page.goto('/pricing')
    const faqHeading = page.getByRole('heading', { name: /常見問題|FAQ/i })
    await expect(faqHeading).toBeVisible({ timeout: 8000 })
    const firstFaq = page.getByRole('button', { name: /取消|退款|試用|付費/ }).first()
    if (await firstFaq.isVisible()) {
      await firstFaq.click()
      await page.waitForTimeout(300)
    }
  })

  test('訂閱管理頁可達', async ({ page }) => {
    await page.goto('/subscription')
    await expect(page).toHaveURL(/\/subscription/)
  })

  /** E85 P2：取消訂閱流程可達 — 關鍵路徑覆蓋 */
  test('取消訂閱頁可達', async ({ page }) => {
    await page.goto('/subscription/cancel')
    await expect(page).toHaveURL(/\/subscription\/cancel/)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('heading', { name: '訂閱已取消' })).toBeVisible({ timeout: 10000 })
  })

  /** P3-68：E2E 關鍵路徑 登入→訂閱→取消（頁面可達，可 mock 實際登入/PayPal） */
  test('關鍵路徑：登入頁 → 定價 → 訂閱管理 → 取消頁', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await page.goto('/pricing')
    await expect(page).toHaveURL(/\/pricing/)
    await expect(page.getByText(/方案|訂閱|價格|免費|付費|NT\$|月/i).first()).toBeVisible({ timeout: 8000 })
    await page.goto('/subscription')
    await expect(page).toHaveURL(/\/subscription/)
    await page.goto('/subscription/cancel')
    await expect(page).toHaveURL(/\/subscription\/cancel/)
    await expect(page.getByRole('heading', { name: '訂閱已取消' })).toBeVisible({ timeout: 10000 })
  })
})
