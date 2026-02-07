#!/usr/bin/env node
/**
 * 完整測試流程：啟動 dev → E2E → 專家審查 → 瀏覽器檢查 → 匯總報告
 * 用法：node scripts/run-full-tests.mjs
 */
import { spawn } from 'child_process'
import { createInterface } from 'readline'
import http from 'http'

const BASE_URL = 'http://localhost:3000'

function waitForServer(maxWait = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      http.get(BASE_URL, (res) => {
        resolve()
      }).on('error', () => {
        if (Date.now() - start > maxWait) reject(new Error('Server timeout'))
        else setTimeout(check, 1000)
      })
    }
    check()
  })
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts })
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))))
  })
}

async function main() {
  console.log('Starting dev server...')
  const dev = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    cwd: process.cwd(),
  })
  let devReady = false
  dev.stdout?.on('data', (d) => {
    if (d.toString().includes('Ready') || d.toString().includes('started')) devReady = true
  })
  dev.stderr?.on('data', (d) => {
    if (d.toString().includes('Ready') || d.toString().includes('started')) devReady = true
  })

  try {
    await waitForServer()
    console.log('Server ready.')
    process.env.PLAYWRIGHT_BASE_URL = BASE_URL
    process.env.BASE_URL = BASE_URL

    await run('npx', ['playwright', 'test'])
    await run('node', ['scripts/expert-audit.mjs', BASE_URL])
    await run('node', ['scripts/mcp-browser-check.mjs', BASE_URL])
    await run('node', ['scripts/aggregate-report.mjs'])
  } finally {
    dev.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
