'use strict'
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const dirs = [
  path.join(root, '.next'),
  path.join(root, 'node_modules', '.cache'),
]

/** Windows ENOTEMPTY：遞迴刪除失敗時重試（最多 3 次，間隔 100ms） */
function rmSyncRetry(dir, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true, maxRetries: 2 })
        return true
      }
      return false
    } catch (e) {
      if (i < retries - 1) {
        const wait = (ms) => { const d = Date.now(); while (Date.now() - d < ms) {} }
        wait(100)
      } else {
        throw e
      }
    }
  }
  return false
}

let cleaned = 0
for (const dir of dirs) {
  try {
    if (fs.existsSync(dir)) {
      rmSyncRetry(dir)
      console.log('Cleaned', path.relative(root, dir))
      cleaned++
    }
  } catch (e) {
    console.warn('Clean warning:', dir, e.message)
  }
}
if (cleaned === 0) console.log('Nothing to clean')
console.log('Done. Run: npm run build && npm run dev (or npm run dev:clean)')
