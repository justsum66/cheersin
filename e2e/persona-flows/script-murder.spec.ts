/**
 * SM-76～SM-80：劇本殺 E2E 大廳→房間→遊戲→結束→離開
 * 關鍵路徑：/script-murder 大廳可達、建立房間、加入、可選開始/離開
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3099'

/** 設定年齡驗證 cookie，繞過 AgeGate（/script-murder 需 18+ 確認） */
async function setAgeVerified(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    { name: 'cheersin_age_verified', value: '1', url: BASE },
  ])
}

test.describe('劇本殺：大廳', () => {
  test('SM-76：大廳可達，顯示劇本列表或空狀態', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'domcontentloaded', timeout: 15000 })

    // 等待載入完成：標題或空狀態
    const title = page.getByRole('heading', { name: /酒局劇本殺|劇本殺|Script murder/i })
    const emptyState = page.getByText(/尚無劇本|No scripts yet/i)
    const scriptsGrid = page.locator('[role="list"]').filter({ has: page.locator('li') })

    await expect(title.or(emptyState).or(scriptsGrid)).toBeVisible({ timeout: 20000 })
  })

  test('SM-76：大廳有返回首頁或派對遊樂場連結', async ({ page }) => {
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'domcontentloaded', timeout: 15000 })

    const backOrParty = page.getByRole('link', { name: /返回首頁|Back to home|派對遊戲|派對遊樂場|Party games|先去派對/i })
    await expect(backOrParty.first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe('劇本殺：建立房間與加入', () => {
  test('SM-77：若有劇本可點建立房間並導向房間頁', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'networkidle', timeout: 25000 })

    const createBtn = page.getByRole('button', { name: /建立房間|建立|Create room/i }).first()
    const visible = await createBtn.isVisible().catch(() => false)
    if (!visible) {
      // 無劇本時跳過建立流程
      await expect(page).toHaveURL(/\/script-murder/)
      return
    }

    await createBtn.click()
    await page.waitForURL(/room=/, { timeout: 30000 }).catch(() => {})
    const hasRoom = page.url().includes('room=')
    expect(hasRoom).toBeTruthy()
  })

  test('SM-78：房間頁可輸入暱稱並加入', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'networkidle', timeout: 25000 })

    const createBtn = page.getByRole('button', { name: /建立房間|建立|Create room/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) {
      test.skip()
      return
    }
    await createBtn.click()
    await page.waitForURL(/room=/, { timeout: 30000 })

    const nameInput = page.getByRole('textbox', { name: /顯示名稱|Display name|暱稱|nickname/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname/i))
    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await nameInput.fill('E2E玩家')

    const joinBtn = page.getByRole('button', { name: /加入|Join/i })
    await expect(joinBtn).toBeVisible()
    await joinBtn.click()

    await page.waitForTimeout(2000)
    await expect(page.getByText(/E2E玩家|已加入|Joined/i)).toBeVisible({ timeout: 10000 })
  })

  test('SM-79：房間內加入後可見玩家列表', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'networkidle', timeout: 25000 })

    const createBtn = page.getByRole('button', { name: /建立房間|建立|Create room/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) {
      test.skip()
      return
    }
    await createBtn.click()
    await page.waitForURL(/room=/, { timeout: 30000 })

    await page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname/i)).fill('E2E列表')
    await page.getByRole('button', { name: /加入|Join/i }).click()
    await page.waitForTimeout(2000)

    const playersLabel = page.getByText(/已加入|Joined|人/)
    await expect(playersLabel).toBeVisible({ timeout: 10000 })
  })
})

test.describe('劇本殺：開始與一輪遊戲（SM-20）', () => {
  test('SM-20：房主可點開始遊戲、確認後見角色或章節', async ({ page }) => {
    test.setTimeout(120000)
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'networkidle', timeout: 25000 })

    const createBtn = page.getByRole('button', { name: /建立房間|建立|Create room/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) {
      test.skip()
      return
    }
    await createBtn.click()
    await page.waitForURL(/room=/, { timeout: 30000 })

    const nameInput = page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname/i))
    await nameInput.fill('E2E房主')
    await page.getByRole('button', { name: /加入|Join/i }).click()
    await page.waitForTimeout(2000)

    const startBtn = page.getByRole('button', { name: /開始遊戲|Start game|分配角色|assign roles/i }).first()
    if (!(await startBtn.isVisible().catch(() => false))) {
      test.skip()
      return
    }
    await startBtn.click()

    const confirmInDialog = page.getByRole('dialog').getByRole('button', { name: /開始遊戲|Start game|分配|assign/i })
    await expect(confirmInDialog).toBeVisible({ timeout: 5000 })
    await confirmInDialog.click()

    const roleOrChapter = page.getByText(/你的角色|Your role|章節|下一章|Next chapter/i)
    await expect(roleOrChapter).toBeVisible({ timeout: 15000 })
  })

})

test.describe('劇本殺：離開', () => {
  test('SM-80：加入後可點離開房間並回大廳', async ({ page }) => {
    test.setTimeout(120000)
    await page.goto('/')
    await setAgeVerified(page)
    await page.goto('/script-murder', { waitUntil: 'networkidle', timeout: 25000 })

    const createBtn = page.getByRole('button', { name: /建立房間|建立|Create room/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) {
      test.skip()
      return
    }
    await createBtn.click()
    await page.waitForURL(/room=/, { timeout: 30000 })

    const nameInput = page.getByRole('textbox', { name: /顯示名稱|Display name/i }).or(page.getByPlaceholder(/輸入暱稱|Enter nickname/i))
    await nameInput.fill('E2E離開測試')
    await page.getByRole('button', { name: /加入|Join/i }).click()
    await page.waitForTimeout(2000)

    const leaveBtn = page.getByRole('button', { name: /離開房間|Leave room|離開/i })
    if (await leaveBtn.isVisible().catch(() => false)) {
      await leaveBtn.click()
      await page.waitForURL(/\/script-murder(?!\?room=)/, { timeout: 15000 }).catch(() => {})
      const backToLobby = !page.url().includes('room=')
      expect(backToLobby).toBeTruthy()
    }
  })
})
