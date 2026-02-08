#!/usr/bin/env node
/**
 * P2-393：定期更新 Pinecone 向量數據庫 — 可由 cron 或 Vercel Cron 觸發
 * 使用與 seed-pinecone 相同的流程，確保 AI 知識為最新。
 * 執行：node --env-file=.env.local scripts/update-embeddings.mjs
 * 或：npm run seed:pinecone（同一套邏輯）
 */
import { spawn } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const script = `${__dirname}/seed-pinecone.mjs`
const child = spawn(process.execPath, [script], {
  stdio: 'inherit',
  env: process.env,
  cwd: `${__dirname}/..`,
})
child.on('exit', (code) => process.exit(code ?? 0))
