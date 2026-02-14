/**
 * P2-409：AI 生成遊戲規則摘要 — 依遊戲 name/description 呼叫 Groq 產生一句 rulesSummary（繁中，30 字內）
 * 使用方式：GROQ_API_KEY=xxx node scripts/generate-rules-summary.mjs [--input=scripts/data/games-list.json] [--output=scripts/data/rules-summary-generated.json]
 * 依賴：僅從環境變數讀取 GROQ_API_KEY（必填），不讀取 .env 檔案；請在 shell 或 .env.local 中設定。
 * 輸入 JSON：陣列 [{ "id", "name", "description" }]。輸出：{ "gameId": "規則摘要", ... }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const DEFAULT_INPUT = join(projectRoot, 'scripts', 'data', 'games-list.json')
const DEFAULT_OUTPUT = join(projectRoot, 'scripts', 'data', 'rules-summary-generated.json')

async function generateOneSummary(groqKey, game) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `請為以下派對喝酒遊戲寫「一句話規則摘要」，繁體中文、30 字以內、結尾可帶「…喝」或「輸喝」等。只回覆那句摘要，不要其他說明。\n遊戲名稱：${game.name}\n簡述：${game.description}`,
        },
      ],
      max_tokens: 80,
      temperature: 0.3,
    }),
  })
  if (!res.ok) throw new Error(`Groq API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim() || ''
  return text.slice(0, 80)
}

function parseArgs() {
  const args = process.argv.slice(2)
  let input = DEFAULT_INPUT
  let output = DEFAULT_OUTPUT
  for (const a of args) {
    if (a.startsWith('--input=')) input = a.slice(8)
    if (a.startsWith('--output=')) output = a.slice(9)
  }
  return { input, output }
}

async function main() {
  const groqKey = process.env.GROQ_SCRIPT_API_KEY || process.env.GROQ_API_KEY
  if (!groqKey) {
    console.error('Need GROQ_SCRIPT_API_KEY or GROQ_API_KEY')
    process.exit(1)
  }
  const { input, output } = parseArgs()
  if (!existsSync(input)) {
    console.error('Input file not found:', input)
    console.error('Create a JSON array of { "id", "name", "description" } (e.g. export from GAMES_META).')
    process.exit(1)
  }
  const list = JSON.parse(readFileSync(input, 'utf8'))
  if (!Array.isArray(list)) {
    console.error('Input must be a JSON array')
    process.exit(1)
  }
  const outDir = dirname(output)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const result = {}
  for (let i = 0; i < list.length; i++) {
    const g = list[i]
    if (!g.id || !g.name) continue
    try {
      result[g.id] = await generateOneSummary(groqKey, g)
      console.log(`[${i + 1}/${list.length}] ${g.id} -> ${result[g.id]}`)
    } catch (e) {
      console.error(`[${g.id}] ${e.message}`)
      result[g.id] = ''
    }
  }
  writeFileSync(output, JSON.stringify(result, null, 2), 'utf8')
  console.log('Wrote', output)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
