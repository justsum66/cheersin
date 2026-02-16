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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'src/__tests__',
        'src/**/*.test.{ts,tsx}',
        'src/types',
        'src/constants',
        'src/styles',
        'src/i18n',
        '.*.config.*',
        'public',
        'dist',
        'build',
        'coverage',
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})