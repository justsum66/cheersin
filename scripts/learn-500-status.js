#!/usr/bin/env node
/**
 * 499 LEARN_500_PLAN 狀態追蹤：統計已完成任務數
 * 執行：node scripts/learn-500-status.js
 */
const fs = require('fs')
const path = require('path')
const planPath = path.join(process.cwd(), 'docs', 'LEARN_500_PLAN.md')
const content = fs.readFileSync(planPath, 'utf8')
const done = (content.match(/\|\s*✅/g) || []).length
const total = 500
const pct = total > 0 ? Math.round((done / total) * 100) : 0
console.log(`LEARN_500: ${done}/${total} 已完成 (${pct}%)`)
process.exit(0)
