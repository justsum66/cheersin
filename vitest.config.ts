import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/** P2 #70：每款遊戲關鍵路徑單元測試。Vitest + React Testing Library。 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // TEST-014：覆蓋率目標可選 — 安裝 @vitest/coverage-v8 後啟用 coverage 區塊
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
