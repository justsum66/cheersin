/**
 * Persona 匯總 Reporter：依 Persona 匯總 E2E 結果
 * 供 comprehensive report 使用
 */
import type { FullResult, TestCase, TestResult } from '@playwright/test/reporter'
import * as fs from 'fs'
import * as path from 'path'

interface PersonaResult {
  personaId: string
  personaName: string
  passed: number
  failed: number
  skipped: number
  flows: { name: string; passed: boolean }[]
}

function extractPersonaFromTitle(title: string): { id: string; name: string } | null {
  const match = title.match(/^([^(]+)\s*\(([^)]+)\)\s*-\s*(.+)$/)
  if (match) {
    return { name: match[1].trim(), id: match[2] }
  }
  return null
}

export default class PersonaReporter {
  private personaMap = new Map<string, PersonaResult>()
  private startTime = 0

  onBegin() {
    this.startTime = Date.now()
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const persona = extractPersonaFromTitle(test.title)
    if (persona) {
      const key = `${persona.name}-${persona.id}`
      let pr = this.personaMap.get(key)
      if (!pr) {
        pr = {
          personaId: persona.id,
          personaName: persona.name,
          passed: 0,
          failed: 0,
          skipped: 0,
          flows: [],
        }
        this.personaMap.set(key, pr)
      }
      if (result.status === 'passed') pr.passed++
      else if (result.status === 'failed') pr.failed++
      else pr.skipped++
      pr.flows.push({
        name: test.title,
        passed: result.status === 'passed',
      })
    }
  }

  onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime
    const personaResults = Array.from(this.personaMap.values())
    const output = {
      meta: {
        date: new Date().toISOString().slice(0, 10),
        duration: `${(duration / 1000).toFixed(1)}s`,
        totalPersonas: personaResults.length,
      },
      personaResults,
    }
    const dir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, 'persona-e2e-summary.json'),
      JSON.stringify(output, null, 2),
      'utf-8'
    )
  }
}
