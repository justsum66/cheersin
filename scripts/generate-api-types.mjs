#!/usr/bin/env node
/**
 * P2-296：由 OpenAPI 生成 API 客戶端類型（可選）
 * 需安裝：npm i -D openapi-typescript
 * 使用：node scripts/generate-api-types.mjs 或 npx openapi-typescript api-docs/openapi.yaml -o src/types/api-generated.d.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const specPath = join(root, 'api-docs', 'openapi.yaml')
const outPath = join(root, 'src', 'types', 'api-generated.d.ts')

try {
  const spec = readFileSync(specPath, 'utf8')
  // 若未安裝 openapi-typescript，僅輸出註解型佔位，提示安裝後可生成完整類型
  const placeholder = `/** P2-296：由 OpenAPI 生成 — 執行 npx openapi-typescript api-docs/openapi.yaml -o src/types/api-generated.d.ts 可覆寫此檔 */
export interface HealthResponse { status: string }
export interface SubscriptionAction { action: string; planType?: string; subscriptionId?: string }
`
  writeFileSync(outPath, placeholder)
  console.log('Wrote', outPath, '(placeholder; install openapi-typescript for full generation)')
} catch (e) {
  console.warn('generate-api-types:', e.message)
}
