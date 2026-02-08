/**
 * Playwright E2E 設定
 * 支援多裝置（mobile/tablet/desktop）、Persona 參數注入、慢速網路
 */
import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const e2ePort = process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? '3099'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-reports/e2e-results.json' }],
    ['html', { outputFolder: 'test-reports/html', open: 'never' }],
    ['./e2e/reporters/persona-report.ts'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        browserName: 'chromium',
      },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 834, height: 1194 },
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: `npx cross-env PORT=${e2ePort} npm run dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  outputDir: 'test-results/',
})
