#!/usr/bin/env node
/**
 * 酒類知識庫 + 酒款資料庫 → Pinecone 向量化上傳
 * 使用前：設定 .env.local 的 OPENROUTER_API_KEY、PINECONE_API_URL、PINECONE_API_KEY
 * Pinecone index dimension 須為 1536（text-embedding-3-small）
 * 執行：node --env-file=.env.local scripts/seed-pinecone.mjs
 *   或：npx dotenv -e .env.local -- node scripts/seed-pinecone.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const EMBEDDING_DIMENSION = parseInt(process.env.EMBEDDING_DIMENSION || '1536', 10)
const OPENROUTER_EMBED = 'https://openrouter.ai/api/v1/embeddings'
const BATCH_SIZE = 50
const NAMESPACE_KNOWLEDGE = 'knowledge'
const NAMESPACE_WINES = 'wines'

function loadEnvLocal() {
  const path = join(root, '.env.local')
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
}

async function getEmbedding(text) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')
  const res = await fetch(OPENROUTER_EMBED, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  })
  if (!res.ok) throw new Error(`Embedding API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const vec = data.data?.[0]?.embedding
  if (!Array.isArray(vec)) throw new Error('Invalid embedding response')
  if (vec.length !== EMBEDDING_DIMENSION) {
    throw new Error(`Embedding dimension ${vec.length} does not match EMBEDDING_DIMENSION ${EMBEDDING_DIMENSION}. Set EMBEDDING_DIMENSION in .env.local to match your Pinecone index.`)
  }
  return vec
}

async function upsertBatch(vectors, namespace) {
  const url = process.env.PINECONE_API_URL
  const key = process.env.PINECONE_API_KEY
  if (!url || !key) throw new Error('PINECONE_API_URL or PINECONE_API_KEY not set')
  const res = await fetch(`${url.replace(/\/+$/, '')}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': key,
      'X-Pinecone-Api-Version': '2025-10',
    },
    body: JSON.stringify({ vectors, namespace }),
  })
  if (!res.ok) throw new Error(`Pinecone upsert ${res.status}: ${await res.text()}`)
  return res.json()
}

/** 將 Markdown 依 ## 章節切塊，每塊帶 course_id 與 chapter */
function chunkMarkdownByChapter(content, courseId) {
  const sections = []
  let currentChapter = ''
  let currentBody = []
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentChapter || currentBody.length) {
        const text = [currentChapter, ...currentBody].filter(Boolean).join('\n').trim()
        if (text) sections.push({ chapter: currentChapter.replace(/^##\s*/, ''), text })
      }
      currentChapter = line
      currentBody = []
    } else {
      currentBody.push(line)
    }
  }
  if (currentChapter || currentBody.length) {
    const text = [currentChapter, ...currentBody].filter(Boolean).join('\n').trim()
    if (text) sections.push({ chapter: currentChapter.replace(/^##\s*/, ''), text })
  }
  return sections.map((s, i) => ({
    id: `kb-${courseId}-${i}-${Date.now()}`,
    course_id: courseId,
    chapter: s.chapter,
    text: s.text,
    source: `${courseId}.md`,
  }))
}

/** 74 課程章節向量化：從 data/courses/*.json 讀取 chapters，每章一筆，metadata 含 course_id / chapter */
function chunksFromCourseJson(coursesDir) {
  if (!existsSync(coursesDir)) return []
  const files = readdirSync(coursesDir).filter((f) => f.endsWith('.json') && f !== 'index.json')
  const allChunks = []
  for (const file of files) {
    const courseId = file.replace(/\.json$/, '')
    const raw = readFileSync(join(coursesDir, file), 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      continue
    }
    const chapters = data.chapters || []
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i]
      const title = ch.title || `Chapter ${i + 1}`
      const text = [title, ch.content].filter(Boolean).join('\n').trim()
      if (!text) continue
      allChunks.push({
        id: `course-${courseId}-ch-${i}-${Date.now()}`,
        course_id: courseId,
        chapter: title,
        text,
        source: `${courseId}.json`,
      })
    }
  }
  return allChunks
}

async function seedKnowledge() {
  const knowledgeDir = join(root, 'data', 'wine-knowledge')
  const coursesDir = join(root, 'data', 'courses')
  const allChunks = []

  if (existsSync(knowledgeDir)) {
    const files = readdirSync(knowledgeDir).filter((f) => f.endsWith('.md'))
    for (const file of files) {
      const courseId = file.replace(/\.md$/, '')
      const content = readFileSync(join(knowledgeDir, file), 'utf8')
      const chunks = chunkMarkdownByChapter(content, courseId)
      allChunks.push(...chunks)
    }
  }

  const courseChunks = chunksFromCourseJson(coursesDir)
  allChunks.push(...courseChunks)

  if (allChunks.length === 0) {
    console.log('No knowledge chunks (wine-knowledge/*.md or data/courses/*.json)')
    return 0
  }
  let total = 0
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE)
    const vectors = []
    for (const c of batch) {
      const vec = await getEmbedding(c.text)
      vectors.push({
        id: c.id,
        values: vec,
        metadata: { text: c.text.slice(0, 40000), course_id: c.course_id, chapter: c.chapter, source: c.source },
      })
    }
    await upsertBatch(vectors, NAMESPACE_KNOWLEDGE)
    total += batch.length
    console.log(`Knowledge: upserted ${total}/${allChunks.length}`)
  }
  return total
}

async function seedWines() {
  const winesPath = join(root, 'data', 'wines.json')
  if (!existsSync(winesPath)) {
    console.log('Skip wines: data/wines.json not found')
    return 0
  }
  const wines = JSON.parse(readFileSync(winesPath, 'utf8'))
  if (!Array.isArray(wines) || wines.length === 0) return 0
  let total = 0
  for (let i = 0; i < wines.length; i += BATCH_SIZE) {
    const batch = wines.slice(i, i + BATCH_SIZE)
    const vectors = []
    for (const w of batch) {
      const text = [w.name, w.type, w.region, w.country, w.description, (w.tags || []).join(' '), w.variety].filter(Boolean).join(' ')
      const vec = await getEmbedding(text)
      const id = w.id || `wine-${i}-${w.name?.replace(/\s/g, '-')}`
      vectors.push({
        id: `wine-${id}`,
        values: vec,
        metadata: { type: 'wine', wine_id: w.id, name: w.name, wine_type: w.type, region: w.region, country: w.country, text: text.slice(0, 1000) },
      })
    }
    await upsertBatch(vectors, NAMESPACE_WINES)
    total += batch.length
    console.log(`Wines: upserted ${total}/${wines.length}`)
  }
  return total
}

async function main() {
  loadEnvLocal()
  if (!process.env.OPENROUTER_API_KEY || !process.env.PINECONE_API_URL || !process.env.PINECONE_API_KEY) {
    console.error('Set OPENROUTER_API_KEY, PINECONE_API_URL, PINECONE_API_KEY in .env.local')
    process.exit(1)
  }
  console.log(`Seed Pinecone: knowledge + wines (dimension ${EMBEDDING_DIMENSION})`)
  const k = await seedKnowledge()
  const w = await seedWines()
  console.log(`Done. Knowledge: ${k}, Wines: ${w}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
