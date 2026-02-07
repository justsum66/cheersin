// Pinecone Vector Database Client
// https://docs.pinecone.io/reference/api/introduction
//
// 內容上線流程：課程/酒款等需先轉成向量再寫入。
// 1. 使用 embedding API（如 lib/embedding.ts getEmbedding）取得文字向量。
// 2. 呼叫 upsertVectors([{ id, values, metadata: { text, course_id, ... } }], namespace)。
// 3. 可寫入 script 或 admin 後台排程執行；查詢端使用 /api/recommend 或 queryVectors。

interface PineconeVector {
    id: string
    values: number[]
    metadata?: Record<string, any>
}

interface PineconeQueryResult {
    matches: {
        id: string
        score: number
        metadata?: Record<string, any>
    }[]
}

import { normalizeEnv, normalizeUrl } from './env'
import { fetchWithRetry } from './fetch-retry'

/** Index host 需無尾端斜線，例如 https://xxx-us-east1-0.aws.pinecone.io */
const PINECONE_API_URL = normalizeUrl(process.env.PINECONE_API_URL)
const PINECONE_API_KEY = normalizeEnv(process.env.PINECONE_API_KEY)
const PINECONE_API_VERSION = '2025-10'
/** P1-19：Pinecone 逾時 15s；P3-34 可重試 5xx */
const PINECONE_TIMEOUT_MS = 15_000
/** P3-52：Pinecone metadata 每向量上限 40KB、key 數建議 ≤100 */
const PINECONE_METADATA_MAX_BYTES = 40_960
const PINECONE_METADATA_MAX_KEYS = 100

function validateMetadata(metadata: Record<string, unknown> | undefined): void {
    if (!metadata || typeof metadata !== 'object') return
    const keys = Object.keys(metadata)
    if (keys.length > PINECONE_METADATA_MAX_KEYS) {
        throw new Error(`Pinecone metadata key count ${keys.length} exceeds limit ${PINECONE_METADATA_MAX_KEYS}`)
    }
    const size = new TextEncoder().encode(JSON.stringify(metadata)).length
    if (size > PINECONE_METADATA_MAX_BYTES) {
        throw new Error(`Pinecone metadata size ${size} bytes exceeds limit ${PINECONE_METADATA_MAX_BYTES}`)
    }
}

function pineconeFetch(url: string, init: RequestInit): Promise<Response> {
    return fetchWithRetry(url, {
        ...init,
        timeoutMs: PINECONE_TIMEOUT_MS,
        retries: 2,
    })
}

// Upsert vectors into index（P3-52：寫入前驗證 metadata 大小與 key 數）
export async function upsertVectors(
    vectors: PineconeVector[],
    namespace?: string
): Promise<{ upsertedCount: number }> {
    for (const v of vectors) {
        validateMetadata(v.metadata as Record<string, unknown> | undefined)
    }
    const response = await pineconeFetch(`${PINECONE_API_URL}/vectors/upsert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': PINECONE_API_KEY,
            'X-Pinecone-Api-Version': PINECONE_API_VERSION,
        },
        body: JSON.stringify({
            vectors,
            namespace
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Pinecone upsert error: ${response.status} - ${error}`)
    }

    return await response.json()
}

// Query similar vectors
export async function queryVectors(
    vector: number[],
    options: {
        topK?: number
        namespace?: string
        includeMetadata?: boolean
        filter?: Record<string, any>
    } = {}
): Promise<PineconeQueryResult> {
    const {
        topK = 5,
        namespace,
        includeMetadata = true,
        filter
    } = options

    const response = await pineconeFetch(`${PINECONE_API_URL}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': PINECONE_API_KEY,
            'X-Pinecone-Api-Version': PINECONE_API_VERSION,
        },
        body: JSON.stringify({
            vector,
            topK,
            namespace,
            includeMetadata,
            filter
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Pinecone query error: ${response.status} - ${error}`)
    }

    return await response.json()
}

// Get index stats
export async function getIndexStats(): Promise<{
    namespaces: Record<string, { vectorCount: number }>
    dimension: number
    indexFullness: number
    totalVectorCount: number
}> {
    const response = await pineconeFetch(`${PINECONE_API_URL}/describe_index_stats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': PINECONE_API_KEY,
            'X-Pinecone-Api-Version': PINECONE_API_VERSION,
        },
        body: JSON.stringify({})
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Pinecone stats error: ${response.status} - ${error}`)
    }

    return await response.json()
}

// Test connection
export async function testPineconeConnection(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
        const stats = await getIndexStats()
        return {
            success: true,
            message: `Connection successful. Total vectors: ${stats.totalVectorCount || 0}`,
            stats
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Delete vectors by ID
export async function deleteVectors(
    ids: string[],
    namespace?: string
): Promise<void> {
    const response = await pineconeFetch(`${PINECONE_API_URL}/vectors/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': PINECONE_API_KEY,
            'X-Pinecone-Api-Version': PINECONE_API_VERSION,
        },
        body: JSON.stringify({
            ids,
            namespace
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Pinecone delete error: ${response.status} - ${error}`)
    }
}
