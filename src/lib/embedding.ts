/**
 * 文字 → 向量（供 Pinecone RAG 使用）
 * 維度須與 Pinecone index 一致；使用 env-config 單一來源。
 * P3-34：使用 fetchWithRetry 逾時 + 指數退避重試
 */
import { OPENROUTER_API_KEY, EMBEDDING_DIMENSION, EMBEDDING_MODEL } from './env-config'
import { fetchWithRetry } from './fetch-retry'

export { EMBEDDING_DIMENSION }
export const EMBEDDING_MODEL_DEFAULT = EMBEDDING_MODEL

/** P1-19：OpenRouter embedding 逾時 15s；P3-34 可重試 5xx */
const EMBEDDING_TIMEOUT_MS = 15_000

export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!text?.trim()) return null
  if (!OPENROUTER_API_KEY) return null

  try {
    const res = await fetchWithRetry('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000),
      }),
      timeoutMs: EMBEDDING_TIMEOUT_MS,
      retries: 2,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { data?: { embedding?: number[] }[] }
    const embedding = data.data?.[0]?.embedding
    return Array.isArray(embedding) ? embedding : null
  } catch {
    return null
  }
}
