import { NextRequest, NextResponse } from 'next/server'
import { queryVectors } from '@/lib/pinecone'
import { getEmbedding } from '@/lib/embedding'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { RecommendPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { logApiError } from '@/lib/api-error-log'
import { PINECONE_API_KEY, PINECONE_API_URL } from '@/lib/env-config'

const NAMESPACE_WINES = 'wines'

/**
 * 76 依靈魂酒測 + 歷史對話從 Pinecone 找酒款；P1-15：限流 30/分/IP；SEC-003 Zod 校驗
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    /** WineRec-28：速率限制 30/分，429 時前端可提示 */
    if (await isRateLimitedAsync(ip, 'recommend')) {
      const res = errorResponse(429, 'RATE_LIMITED', { message: '操作過於頻繁，請 1 分鐘後再試（每分鐘最多 30 次）' })
      res.headers.set('Retry-After', '60')
      res.headers.set('X-RateLimit-Limit', '30')
      return res
    }
    const parsed = await zodParseBody(request, RecommendPostBodySchema)
    if (!parsed.success) return parsed.response
    const body = parsed.data

    if (!PINECONE_API_KEY || !PINECONE_API_URL) {
      return errorResponse(503, 'SERVICE_NOT_CONFIGURED', { message: 'Pinecone 未設定，無法提供推薦' })
    }

    let vector: number[] | null = null
    let namespace = body.namespace
    let topK = Math.min(Math.max(1, body.topK ?? 5), 20)

    if (Array.isArray(body.vector) && body.vector.length > 0) {
      vector = body.vector
    } else if (body.soul_wine != null || body.soul_wine_type != null || (body.quiz_tags?.length) || body.recentChat != null) {
      const parts = [
        body.soul_wine,
        body.soul_wine_type,
        Array.isArray(body.quiz_tags) ? body.quiz_tags.join(' ') : '',
        body.recentChat,
      ].filter(Boolean)
      const text = parts.join(' ')
      const embedding = await getEmbedding(text)
      if (!embedding?.length) {
        return NextResponse.json(
          { error: 'Embedding failed', matches: [] },
          { status: 200 }
        )
      }
      vector = embedding
      namespace = NAMESPACE_WINES
    }

    if (!vector || vector.length === 0) {
      return NextResponse.json(
        { error: 'Provide "vector" (number[]) or "soul_wine" / "recentChat" for smart recommend' },
        { status: 400 }
      )
    }

    const result = await queryVectors(vector, {
      topK,
      namespace,
      includeMetadata: true,
    })

    const res = NextResponse.json({
      matches: result.matches,
      count: result.matches.length,
    })
    // 186–193 API 快取：推薦結果可短暫快取（60s）減少重複 embedding
    res.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120')
    res.headers.set('X-RateLimit-Limit', '30')
    return res
  } catch (error) {
    /** BE-15/SEC-17：結構化 log，不含 body/PII */
    logApiError('recommend', error)
    return serverErrorResponse(error)
  }
}
