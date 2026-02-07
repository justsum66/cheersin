#!/usr/bin/env node
/**
 * 匯總測試報告：合併 E2E、專家審查、瀏覽器檢查產出 comprehensive-report-{date}.json 與 REPORT-{date}.md
 * 用法：node scripts/aggregate-report.mjs
 */
import fs from 'fs'
import path from 'path'

const REPORTS_DIR = path.join(process.cwd(), 'test-reports')
const date = new Date().toISOString().slice(0, 10)

function readJson(name) {
  const p = path.join(REPORTS_DIR, name)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return null
  }
}

function main() {
  const personaE2e = readJson('persona-e2e-summary.json')
  const expertAudit = readJson('expert-audit-report.json')
  const browserCheck = readJson('mcp-browser-check-report.json')
  const e2eResults = readJson('e2e-results.json')

  const personaResults = personaE2e?.personaResults ?? []
  const expertResults = expertAudit
    ? [
        {
          expertId: 'expert-audit',
          category: 'automated',
          score: expertAudit.summary?.score ?? 0,
          totalChecks: expertAudit.summary?.totalChecks ?? 0,
          passed: expertAudit.summary?.passed ?? 0,
          items: expertAudit.pageResults?.flatMap((p) => p.checks ?? []) ?? [],
        },
      ]
    : []
  const expertFailed = (expertAudit?.pageResults ?? [])
    .flatMap((p) => (p.checks ?? []).filter((c) => !c.passed).map((c) => `${p.name}: ${c.text}`))
  const axeFailed = (expertAudit?.axeResults ?? [])
    .filter((r) => !r.axe?.passed)
    .map((r) => `A11y ${r.name}: ${r.axe?.detail ?? ''}`)
  const criticalIssues = [
    ...(expertAudit?.criticalIssues ?? []),
    ...expertFailed,
    ...axeFailed,
    ...(personaResults.filter((p) => p.failed > 0).map((p) => `Persona ${p.personaName} 有 ${p.failed} 失敗`)),
  ]
  const optimizationPriorities = criticalIssues.length > 0
    ? criticalIssues.map((issue, i) => ({ priority: i + 1, issue }))
    : []

  const comprehensive = {
    meta: {
      date,
      generatedAt: new Date().toISOString(),
      duration: expertAudit?.meta?.duration ?? personaE2e?.meta?.duration ?? 'N/A',
    },
    personaResults,
    expertResults,
    browserCheckSummary: browserCheck?.summary ?? null,
    criticalIssues,
    optimizationPriorities,
  }

  const outJson = path.join(REPORTS_DIR, `comprehensive-report-${date}.json`)
  fs.writeFileSync(outJson, JSON.stringify(comprehensive, null, 2), 'utf-8')
  console.log('Written:', outJson)

  const md = [
    `# Cheersin 全面測試報告`,
    ``,
    `**日期**: ${date}`,
    ``,
    `## 摘要`,
    ``,
    `| 項目 | 結果 |`,
    `|------|------|`,
    `| Persona 測試 | ${personaResults.length} 個 Persona |`,
    `| 專家審查分數 | ${expertResults[0]?.score ?? 'N/A'}% |`,
    `| 瀏覽器檢查 | ${browserCheck?.summary?.passed ?? 'N/A'}/${browserCheck?.summary?.total ?? 'N/A'} 通過 |`,
    ``,
    `## 關鍵問題`,
    ``,
    ...(criticalIssues.length > 0
      ? criticalIssues.map((i) => `- ${i}`)
      : ['- 無']),
    ``,
    `## 優化優先順序`,
    ``,
    ...(optimizationPriorities.length > 0
      ? optimizationPriorities.map((p) => `${p.priority}. ${p.issue}`)
      : ['- 無']),
    ``,
    `## 詳細報告`,
    ``,
    `- \`comprehensive-report-${date}.json\` - 完整 JSON`,
    `- \`persona-e2e-summary.json\` - Persona E2E 匯總`,
    `- \`expert-audit-report.json\` - 專家審查`,
    `- \`mcp-browser-check-report.json\` - 瀏覽器檢查`,
  ].join('\n')

  const outMd = path.join(REPORTS_DIR, `REPORT-${date}.md`)
  fs.writeFileSync(outMd, md, 'utf-8')
  console.log('Written:', outMd)
}

main()
