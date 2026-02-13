#!/usr/bin/env node
/**
 * 驗證 .env.local 格式與前綴（不輸出完整 key）。
 * 執行：node scripts/validate-env.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const envPath = join(root, '.env.local')

function parseEnv(content) {
  const out = {}
  for (const line of content.split('\n')) {
    const trimmed = line.replace(/\r$/, '').trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).trim()
    }
    out[key] = val
  }
  return out
}

function mask(s, head = 8, tail = 4) {
  if (!s || s.length < head + tail) return s ? '***' : '(empty)'
  return s.slice(0, head) + '...' + s.slice(-tail)
}

const checks = [
  { key: 'GROQ_API_KEY', prefix: 'gsk_', minLen: 50, name: 'Groq' },
  { key: 'NVIDIA_NIM_API_KEY', prefix: 'nvapi-', minLen: 40, name: 'NVIDIA NIM', optional: true },
  { key: 'OPENROUTER_API_KEY', prefix: 'sk-or-', minLen: 60, name: 'OpenRouter' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', prefix: 'https://', noTrailingSlash: true, name: 'Supabase URL' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', prefix: 'eyJ', minLen: 100, name: 'Supabase service key' },
  { key: 'PINECONE_API_URL', prefix: 'https://', contains: '.pinecone.io', noTrailingSlash: true, name: 'Pinecone URL' },
  { key: 'PINECONE_API_KEY', minLen: 20, name: 'Pinecone key' },
]

if (!existsSync(envPath)) {
  console.error('.env.local not found. Copy .env.example to .env.local and fill in.')
  process.exit(1)
}

const raw = readFileSync(envPath, 'utf8')
if (raw.charCodeAt(0) === 0xFEFF) {
  console.warn('Warning: .env.local has BOM at start. Remove it (save as UTF-8 without BOM).')
}
const env = parseEnv(raw)
const errors = []
const ok = []

for (const c of checks) {
  const val = (env[c.key] ?? '').replace(/\r\n/g, '\n').trim()
  if (!val) {
    if (c.optional) continue
    errors.push(`${c.key}: missing`)
    continue
  }
  if (c.prefix && !val.startsWith(c.prefix)) {
    errors.push(`${c.key}: expected prefix "${c.prefix}", got ${mask(val)}`)
    continue
  }
  if (c.minLen && val.length < c.minLen) {
    errors.push(`${c.key}: too short (${val.length} chars), expected >= ${c.minLen}`)
    continue
  }
  if (c.noTrailingSlash && val.endsWith('/')) {
    errors.push(`${c.key}: remove trailing slash`)
    continue
  }
  if (c.contains && !val.includes(c.contains)) {
    errors.push(`${c.key}: expected to contain "${c.contains}" (use index HOST)`)
    continue
  }
  ok.push(`${c.key}: OK (${mask(val)}, ${val.length} chars)`)
}

// Warn if Supabase URL points to unreachable project (ENOTFOUND)
const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
if (supabaseUrl && supabaseUrl.includes('etrqxhpbhimrkcyolbrr')) {
  console.warn('\n⚠️  WARNING: NEXT_PUBLIC_SUPABASE_URL points to etrqxhpbhimrkcyolbrr which may be unreachable.')
  console.warn('   Use wdegandlipgdvqhgmoai: https://wdegandlipgdvqhgmoai.supabase.co')
}

if (errors.length) {
  console.error('Issues in .env.local:\n' + errors.map(e => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log('All required env vars look valid:\n' + ok.map(e => '  ' + e).join('\n'))
