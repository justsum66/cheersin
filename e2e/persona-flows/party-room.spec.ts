/**
 * PR-30：派對房 E2E — 建立房間 → 加入 → 乾杯 → 複製連結 → 房主選遊戲
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3099'

/** 設定年齡驗證 cookie，繞過 AgeGate */
async function setAgeVerified(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    { name: 'cheersin_age_verified', value: '1', url: BASE },
  ])
}

test.describe('派對房：建立房間', () => {
  test('PR-30：進入 /party-room 後自動建立房間並出現加入表單或 room= URL', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto(BASE + '/')
    await setAgeVerified(page)
    await page.goto(BASE + '/party-room', { waitUntil: 'domcontentloaded', timeout: 15000 })

    // 等待：URL 出現 room= 或出現加入房間表單（建立者也要加入）
    await page.waitForURL(/\/party-room\?room=/, { timeout: 45000 }).catch(() => {})
    const joinHeading = page.getByRole('heading', { name: /加入房間|Join room/i })
    const nameInput = page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname/i))
    await expect(joinHeading.or(nameInput)).toBeVisible({ timeout: 15000 })
    const hasRoom = page.url().includes('room=')
    expect(hasRoom).toBeTruthy()
  })
})

test.describe('派對房：加入與房內', () => {
  test('PR-30：輸入暱稱加入後可見房內 UI（乾杯、玩家列表）', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto(BASE + '/')
    await setAgeVerified(page)
    await page.goto(BASE + '/party-room', { waitUntil: 'networkidle', timeout: 25000 })

    await page.waitForURL(/\/party-room\?room=/, { timeout: 45000 }).catch(() => {})
    const nameInput = page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname|max 20/i))
    await expect(nameInput).toBeVisible({ timeout: 15000 })
    await nameInput.fill('E2E派對')
    await page.getByRole('button', { name: /加入|Join/i }).click()

    // 房內：乾杯按鈕或已乾杯、玩家列表
    const cheersBtn = page.getByRole('button', { name: /乾杯|Cheers/i })
    const cheersCountText = page.getByText(/已乾杯|Cheers count/i)
    const playersOrPeople = page.getByText(/目前|人|People|Players/i)
    await expect(cheersBtn.or(cheersCountText).or(playersOrPeople)).toBeVisible({ timeout: 15000 })
  })

  test('PR-30：點乾杯後可見已乾杯計數或文案', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto(BASE + '/')
    await setAgeVerified(page)
    await page.goto(BASE + '/party-room', { waitUntil: 'networkidle', timeout: 25000 })

    await page.waitForURL(/\/party-room\?room=/, { timeout: 45000 }).catch(() => {})
    await page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname|max 20/i)).fill('E2E乾杯')
    await page.getByRole('button', { name: /加入|Join/i }).click()

    const cheersBtn = page.getByRole('button', { name: /乾杯|Cheers/i })
    await expect(cheersBtn).toBeVisible({ timeout: 15000 })
    await cheersBtn.click()

    const cheersCountText = page.getByText(/已乾杯|Cheers count/i)
    await expect(cheersCountText).toBeVisible({ timeout: 5000 })
  })

  test('PR-30：點邀請連結後按鈕切換為已複製或顯示已複製', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto(BASE + '/')
    await setAgeVerified(page)
    await page.goto(BASE + '/party-room', { waitUntil: 'networkidle', timeout: 25000 })

    await page.waitForURL(/\/party-room\?room=/, { timeout: 45000 }).catch(() => {})
    await page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname|max 20/i)).fill('E2E複製')
    await page.getByRole('button', { name: /加入|Join/i }).click()

    const inviteBtn = page.getByRole('button', { name: /邀請連結|Invite link|複製|Copy invite/i })
    await expect(inviteBtn).toBeVisible({ timeout: 15000 })
    await inviteBtn.click()

    const copiedState = page.getByText(/已複製|Copied/i)
    await expect(copiedState).toBeVisible({ timeout: 3000 })
  })

  test('PR-30：房主可選遊戲（真心話/轉盤/骰子）並見目前遊戲', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto(BASE + '/')
    await setAgeVerified(page)
    await page.goto(BASE + '/party-room', { waitUntil: 'networkidle', timeout: 25000 })

    await page.waitForURL(/\/party-room\?room=/, { timeout: 45000 }).catch(() => {})
    await page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname|max 20/i)).fill('E2E房主')
    await page.getByRole('button', { name: /加入|Join/i }).click()

    // 房主選遊戲按鈕：真心話 / 轉盤 / 骰子（任一語系）
    const truthOrDareBtn = page.getByRole('button', { name: /真心話|Truth or dare/i })
    const rouletteBtn = page.getByRole('button', { name: /轉盤|Roulette/i })
    const liarDiceBtn = page.getByRole('button', { name: /骰子|Liar dice/i })
    const gameBtn = truthOrDareBtn.or(rouletteBtn).or(liarDiceBtn)
    await expect(gameBtn.first()).toBeVisible({ timeout: 15000 })

    await truthOrDareBtn.first().click()

    // 選中態或「目前：真心話」文案
    const currentGame = page.getByText(/目前|Current|真心話|Truth or dare/i)
    await expect(currentGame).toBeVisible({ timeout: 5000 })
  })
})
