'use strict'
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const dirs = [
  path.join(root, '.next'),
  path.join(root, 'node_modules', '.cache'),
]
let cleaned = 0
for (const dir of dirs) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
      console.log('Cleaned', path.relative(root, dir))
      cleaned++
    }
  } catch (e) {
    console.warn('Clean warning:', dir, e.message)
  }
}
if (cleaned === 0) console.log('Nothing to clean')
console.log('Done. Run: npm run build && npm run dev (or npm run dev:clean)')
