import { NextRequest, NextResponse } from 'next/server'
import {
  chatWithSommelier,
  chatWithSommelierStream,
  chatWithSommelierVision,
  getSommelierSystemPrompt,
  GROQ_CHAT_MODEL,
  GROQ_VISION_MODEL,
  type ChatMessage,
  type SommelierUserContext,
  type VisionMessage,
} from '@/lib/groq'
import { ChatPostBodySchema } from '@/lib/api-body-schemas'
import { errorResponse } from '@/lib/api-response'
import { chatWithNIM, chatWithNIMStream, hasNIM } from '@/lib/nim'
import { chatWithOpenRouter } from '@/lib/openrouter'
import { getEmbedding } from '@/lib/embedding'
import { queryVectors } from '@/lib/pinecone'
import { recordApiCall } from '@/lib/api-usage'
import { hasPinecone, hasGroq, hasOpenRouter } from '@/lib/env-config'
import { parseWinesFromResponse } from '@/lib/wine-response'
import type { ChatProvider } from '@/config/chat.config'
import {
  CHAT_FALLBACK_ORDER,
  RAG_NAMESPACE,
  RAG_SCORE_MIN,
  RAG_SIMILAR_TOP_K_CONFIG,
  RAG_TOP_K_CONFIG,
} from '@/config/chat.config'
import { getCurrentUser } from '@/lib/get-current-user'
import { persistChatHistory } from '@/lib/chat-history-persist'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { hasUpstashRedis, checkRateLimitUpstash } from '@/lib/rate-limit-upstash'
import { getLongCached, setLongCached, shouldLongCache } from '@/lib/chat-response-cache'
import { getGamesListForPrompt } from '@/lib/games-for-ai'
import {
  isCocktailIntent,
  extractCocktailSearchQuery,
  searchCocktails,
  formatCocktailsForPrompt,
} from '@/lib/cocktaildb'
import { serverFlags } from '@/lib/feature-flags'

const NAMESPACE_WINES = 'wines'

const MAX_RETRIES = 2
/** EXPERT_60 P2：速率限制依訂閱分級 — Free 10/min，Pro 60/min */
const RATE_LIMIT_FREE_PER_MIN = 10
const RATE_LIMIT_PRO_PER_MIN = 60
const MAX_USER_MESSAGE_LENGTH = 2000
/** P0-07：防 DoS / 注入 — messages 與 content 上限 */
const MAX_MESSAGES_LENGTH = 50
const MAX_SINGLE_CONTENT_LENGTH = 8000
const MAX_IMAGE_BASE64_BYTES = 4 * 1024 * 1024 // 4MB，與 Groq 上限一致

/** 非串流回應快取：key = 最後一則用戶訊息，TTL 60s，最多 50 筆，減少重複請求 */
const CACHE_TTL_MS = 60_000
const CACHE_MAX = 50
const responseCache = new Map<string, { at: number; message: string; sources: { index: number; source: string }[]; similarQuestions: string[] }>()
/** P1-17：快取 key 含 tier，避免跨用戶/方案共用同一條目 */
function getCacheKey(lastUser: string, tier?: string): string {
  const msgPart = lastUser.trim().slice(0, 500)
  const tierPart = tier === 'basic' || tier === 'premium' ? tier : 'free'
  return `${msgPart}|${tierPart}`
}
function getCached(lastUser: string, tier?: string): { message: string; sources: { index: number; source: string }[]; similarQuestions: string[] } | null {
  const key = getCacheKey(lastUser, tier)
  const entry = responseCache.get(key)
  if (!entry || Date.now() - entry.at > CACHE_TTL_MS) return null
  return { message: entry.message, sources: entry.sources, similarQuestions: entry.similarQuestions }
}
function setCached(lastUser: string, tier: string | undefined, value: { message: string; sources: { index: number; source: string }[]; similarQuestions: string[] }): void {
  if (responseCache.size >= CACHE_MAX) {
    const oldest = [...responseCache.entries()].sort((a, b) => a[1].at - b[1].at)[0]
    if (oldest) responseCache.delete(oldest[0])
  }
  responseCache.set(getCacheKey(lastUser, tier), { ...value, at: Date.now() })
}

function getRateLimitPerMin(tier: string | undefined): number {
  return tier === 'basic' || tier === 'premium' ? RATE_LIMIT_PRO_PER_MIN : RATE_LIMIT_FREE_PER_MIN
}

const OFFLINE_FALLBACK_REPLIES = [
  '目前無法連線到 AI，請稍後再試。可以先逛逛我們的酒類知識或測驗！',
  '服務暫時忙碌，請幾分鐘後再問一次。',
  '連線不穩，建議您稍後再試。飲酒過量有害健康～',
]

function sanitizeUserInput(text: string): string {
  let s = (text ?? '').trim().slice(0, MAX_USER_MESSAGE_LENGTH)
  if (/^(ignore|system|assistant|user):/i.test(s)) s = s.replace(/^(ignore|system|assistant|user):\s*/i, '')
  return s
}

/** 依 CHAT_FALLBACK_ORDER + has* + USE_OPENROUTER_FALLBACK 過濾，非串流與串流共用 */
function getEffectiveFallbackOrder(): ChatProvider[] {
  return CHAT_FALLBACK_ORDER.filter((p) => {
    if (p === 'groq') return hasGroq
    if (p === 'nim') return hasNIM()
    if (p === 'openrouter') return hasOpenRouter && serverFlags.useOpenRouterFallback
    return false
  })
}

/** 建構 NIM/OpenRouter 用 messages（system + messages） */
function buildOpenRouterMessages(systemPrompt: string, messages: ChatMessage[]): { role: 'user' | 'assistant' | 'system'; content: string }[] {
  return [{ role: 'system', content: systemPrompt }, ...messages]
}

/** P2-390：失敗時記錄 success: false 與 latency，供監控與 Fallback 分析 */
function recordChatFailure(provider: string, model: string, startMs: number, reason?: string): void {
  recordApiCall({
    endpoint: 'chat',
    model: `${provider}/${model}`,
    success: false,
    latencyMs: Date.now() - startMs,
  })
  if (reason) logger.warn(`[chat fallback] ${provider} failed`, { reason })
}

/** P3-51 / P2-410 / P2-390：Chat 主線依 CHAT_FALLBACK_ORDER 依序嘗試；記錄 model、latency、Token 用量；失敗時記錄供監控 */
async function chatWithGroqOrFallback(
  messages: ChatMessage[],
  userContext?: SommelierUserContext,
  startMs?: number
): Promise<{ message: string; model: string }> {
  const systemPrompt = getSommelierSystemPrompt(userContext)
  const openRouterMessages = buildOpenRouterMessages(systemPrompt, messages)

  for (const provider of getEffectiveFallbackOrder()) {
    if (provider === 'groq') {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { text, usage } = await chatWithSommelier(messages, userContext)
          const model = `groq/${GROQ_CHAT_MODEL}`
          if (startMs != null) {
            recordApiCall({
              endpoint: 'chat',
              model,
              success: true,
              latencyMs: Date.now() - startMs,
              promptTokens: usage?.prompt_tokens,
              completionTokens: usage?.completion_tokens,
              totalTokens: usage?.total_tokens,
            })
          }
          return { message: text, model }
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error)
          const is429 = (err: unknown) =>
            (err as { status?: number })?.status === 429 ||
            /rate limit|429/i.test(reason)
          if (startMs != null) recordChatFailure('groq', GROQ_CHAT_MODEL, startMs, reason)
          if (is429(error)) {
            logger.warn('Groq 429 rate limit, skip retry and try next provider')
            break
          }
          if (attempt < MAX_RETRIES) logger.warn(`Groq attempt ${attempt + 1} failed, retrying`, { provider: 'groq', attempt: attempt + 1, reason })
          else break
        }
      }
      continue
    }
    if (provider === 'nim' && hasNIM()) {
      try {
        const text = await chatWithNIM(openRouterMessages, { systemPrompt, temperature: 0.8, maxTokens: 1024 })
        const model = 'nvidia-nim/llama'
        if (startMs != null) recordApiCall({ endpoint: 'chat', model, success: true, latencyMs: Date.now() - startMs })
        return { message: text, model }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        if (startMs != null) recordChatFailure('nim', 'llama', startMs, reason)
        logger.warn('NIM chat failed, trying next provider', { provider: 'nim', reason })
      }
      continue
    }
    if (provider === 'openrouter') {
      try {
        const { text, usage } = await chatWithOpenRouter(openRouterMessages, { temperature: 0.8, maxTokens: 1024 })
        const model = 'openrouter/fallback'
        if (startMs != null) recordApiCall({
          endpoint: 'chat',
          model,
          success: true,
          latencyMs: Date.now() - startMs,
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
          totalTokens: usage?.total_tokens,
        })
        return { message: text, model }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        if (startMs != null) recordChatFailure('openrouter', 'fallback', startMs, reason)
        logger.warn('OpenRouter chat failed, trying next provider', { provider: 'openrouter', reason })
      }
    }
  }

  if (startMs != null) recordApiCall({ endpoint: 'chat', model: 'all-failed', success: false, latencyMs: Date.now() - startMs })
  throw new Error('All chat providers failed')
}

/** RAG：用最後一則用戶訊息查 Pinecone，回傳帶編號的 context 與 sources（引用來源標注）；topK/namespace 可配置，低於 RAG_SCORE_MIN 的結果過濾 */
async function enrichContextWithRag(
  messages: ChatMessage[],
  userContext?: SommelierUserContext
): Promise<SommelierUserContext | undefined> {
  const lastUserContent = [...messages].reverse().find((m) => m.role === 'user')?.content
  if (!lastUserContent || !hasPinecone) {
    return userContext
  }
  try {
    const embedding = await getEmbedding(lastUserContent)
    if (!embedding?.length) return userContext
    const result = await queryVectors(embedding, {
      topK: RAG_TOP_K_CONFIG,
      includeMetadata: true,
      namespace: RAG_NAMESPACE,
    })
    const matches = (result.matches ?? []).filter(
      (m) => RAG_SCORE_MIN <= 0 || (typeof (m as { score?: number }).score === 'number' && (m as { score: number }).score >= RAG_SCORE_MIN)
    )
    if (!matches.length) return userContext
    const sources: { index: number; source: string; text: string }[] = []
    const numberedBlocks = matches.map((m, i) => {
      const text = (m.metadata?.text as string) || (m.metadata?.content as string) || ''
      const source = [m.metadata?.course_id, m.metadata?.chapter].filter(Boolean).join(' / ') || (m.metadata?.source as string) || m.id
      sources.push({ index: i + 1, source, text: text.slice(0, 500) })
      return `[${i + 1}] ${text.slice(0, 800)}`
    })
    const ragContext = numberedBlocks.join('\n\n')
    if (!ragContext) return userContext
    return { ...userContext, ragContext, ragSources: sources }
  } catch {
    return userContext
  }
}

/** 根據助理回答內容查 Pinecone，回傳相似問題/主題（相似問題推薦）；topK 可配置，低分過濾 */
async function getSimilarQuestions(
  assistantReply: string,
  userQuestion: string
): Promise<string[]> {
  if (!hasPinecone) return []
  try {
    const text = `${userQuestion}\n${assistantReply}`.slice(0, 2000)
    const embedding = await getEmbedding(text)
    if (!embedding?.length) return []
    const result = await queryVectors(embedding, {
      topK: RAG_SIMILAR_TOP_K_CONFIG,
      includeMetadata: true,
      namespace: RAG_NAMESPACE,
    })
    const matches = (result.matches ?? []).filter(
      (m) => RAG_SCORE_MIN <= 0 || (typeof (m as { score?: number }).score === 'number' && (m as { score: number }).score >= RAG_SCORE_MIN)
    )
    return matches
      .map((m) => (m.metadata?.chapter as string) || (m.metadata?.source as string) || '')
      .filter(Boolean)
      .slice(0, RAG_SIMILAR_TOP_K_CONFIG)
  } catch {
    return []
  }
}

function streamLine(obj: object): string {
  return JSON.stringify(obj) + '\n'
}

/** Chat API：速率限制（依 tier）、內容預檢、支援 stream、離線回覆；SEC-003 Zod 校驗 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null)
    const parsed = ChatPostBodySchema.safeParse(raw)
    if (!parsed.success) {
      return errorResponse(400, 'Invalid body', { message: '請提供有效的 messages 陣列' })
    }
    const { messages, userContext: rawContext, last5Turns, stream: useStream, imageBase64, subscriptionTier } = parsed.data

    /** P3-64：可選寫入 chat_history；與主流程並行取得 user，不阻塞回應 */
    const userPromise = getCurrentUser()

    /** P0-07：輸入長度與型別嚴格驗證 */
    if (!Array.isArray(messages) || messages.length > MAX_MESSAGES_LENGTH) {
      return NextResponse.json(
        { error: 'Invalid payload', message: `messages 最多 ${MAX_MESSAGES_LENGTH} 則` },
        { status: 400 }
      )
    }
    for (const m of messages) {
      if (typeof m?.content === 'string' && m.content.length > MAX_SINGLE_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: 'Invalid payload', message: `單則訊息最多 ${MAX_SINGLE_CONTENT_LENGTH} 字元` },
          { status: 400 }
        )
      }
    }
    if (typeof imageBase64 === 'string' && imageBase64.trim().length > 0) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim()
        const decodedLen = Buffer.from(base64Data, 'base64').length
        if (decodedLen > MAX_IMAGE_BASE64_BYTES) {
          return NextResponse.json(
            { error: 'Invalid payload', message: '圖片大小不得超過 4MB' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid payload', message: 'imageBase64 格式錯誤' },
          { status: 400 }
        )
      }
    }

    /** EXPERT_60 P2：依 tier 不同 limit；R2-028：有 Upstash Redis 時用 Redis 限流（多實例一致） */
    const limitPerMin = getRateLimitPerMin(subscriptionTier)
    const clientIp = getClientIp(request.headers)
    const tier = subscriptionTier === 'basic' || subscriptionTier === 'premium' ? 'pro' as const : 'free' as const
    const rateLimitResult = hasUpstashRedis()
      ? (await checkRateLimitUpstash(`chat:${clientIp}`, { tier })) ?? checkRateLimit(`chat:${clientIp}`, { windowMs: 60000, maxRequests: limitPerMin })
      : checkRateLimit(`chat:${clientIp}`, { windowMs: 60000, maxRequests: limitPerMin })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limited',
          message: '請求過於頻繁，請稍後再試。',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
          upgrade: true,
          upgradeHint: '升級 Pro 可享有更高頻率限制。',
        },
        { 
          status: 429, 
          headers: { 
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt)
          } 
        }
      )
    }

    const lastUserContent = [...messages].reverse().find((m) => m.role === 'user')?.content
    if (lastUserContent !== undefined && typeof lastUserContent === 'string') {
      const sanitized = sanitizeUserInput(lastUserContent)
      if (sanitized !== lastUserContent) {
        const idx = messages.findLastIndex((m) => m.role === 'user')
        if (idx >= 0) messages[idx] = { ...messages[idx], content: sanitized }
      }
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    const lastUserStr = typeof lastUser === 'string' ? lastUser : ''

    const userContext: SommelierUserContext = {
      ...rawContext,
      recentTurns: last5Turns?.slice(-10)?.slice(-5),
      gamesListForPrompt: getGamesListForPrompt(),
    }
    /** R2-022：用戶問調酒時呼叫 TheCocktailDB 並注入題材 */
    if (lastUserStr && isCocktailIntent(lastUserStr)) {
      try {
        const query = extractCocktailSearchQuery(lastUserStr)
        const cocktails = await searchCocktails(query)
        if (cocktails.length > 0) {
          userContext.cocktailContext = formatCocktailsForPrompt(cocktails)
        }
      } catch {
        /* 調酒 API 失敗不影響主流程 */
      }
    }
    const contextWithRag = await enrichContextWithRag(messages, userContext)
    const sources = contextWithRag?.ragSources?.map((s) => ({ index: s.index, source: s.source })) ?? []

    const startMs = Date.now()

    /** B1-46 酒標辨識：有附圖時走 Vision API（非串流），Groq 上限 4MB base64 */
    const imageDataUrl = typeof imageBase64 === 'string' && imageBase64.trim().length > 0
      ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`)
      : null
    if (imageDataUrl) {
      const textPrompt = lastUserStr.trim() || '請辨識這張酒標或圖片中的酒款，並簡要說明產區、風格與搭配建議。'
      const visionMessages: VisionMessage[] = [
        ...messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content } as VisionMessage)),
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ]
      try {
        const visionResponse = await chatWithSommelierVision(visionMessages, contextWithRag)
        recordApiCall({ endpoint: 'chat', model: `groq/${GROQ_VISION_MODEL}`, success: true, latencyMs: Date.now() - startMs })
        const similarQuestions = await getSimilarQuestions(visionResponse, lastUserStr)
        const { text: messageText, wines } = parseWinesFromResponse(visionResponse)
        userPromise.then((u) => void persistChatHistory(u?.id, lastUserStr, visionResponse))
        return NextResponse.json({
          message: messageText,
          wines: wines?.length ? wines : undefined,
          sources,
          similarQuestions,
        })
      } catch (visionErr) {
        logger.warn('Vision chat failed, falling back to text-only', { err: visionErr instanceof Error ? visionErr.message : String(visionErr) })
        recordApiCall({ endpoint: 'chat', model: 'groq/vision-fail', success: false, latencyMs: Date.now() - startMs })
        // Vision 失敗時不 return，繼續走下方文字流程（依 CHAT_FALLBACK_ORDER 用純文字再試）
      }
    }

    /** 非串流：快取命中則直接回傳（P1-17 短期；P2-395 長期常見問答） */
    if (!useStream && !imageDataUrl) {
      const cached = getCached(lastUserStr, subscriptionTier)
      if (cached) {
        const { text: messageText, wines } = parseWinesFromResponse(cached.message)
        return NextResponse.json(
          { message: messageText, wines: wines?.length ? wines : undefined, sources: cached.sources, similarQuestions: cached.similarQuestions },
          { headers: { 'X-Cache': 'HIT' } }
        )
      }
      const longCached = getLongCached(lastUserStr, subscriptionTier)
      if (longCached) {
        const { text: messageText, wines } = parseWinesFromResponse(longCached.message)
        return NextResponse.json(
          { message: messageText, wines: wines?.length ? wines : undefined, sources: longCached.sources, similarQuestions: longCached.similarQuestions },
          { headers: { 'X-Cache': 'HIT-LONG' } }
        )
      }
    }

    /** 串流路徑：依 CHAT_FALLBACK_ORDER 與 provider 可用性依序嘗試 Groq stream → NIM stream → OpenRouter 非串流 */
    if (useStream && !imageDataUrl) {
      const encoder = new TextEncoder()
      const systemPrompt = getSommelierSystemPrompt(contextWithRag)
      const streamOrder = getEffectiveFallbackOrder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(encoder.encode(streamLine({ type: 'meta', sources })))
            let fullContent = ''
            let streamUsed = false
            let lastErr: unknown
            for (const provider of streamOrder) {
              try {
                if (provider === 'groq') {
                  for await (const chunk of chatWithSommelierStream(messages, contextWithRag)) {
                    fullContent += chunk
                    controller.enqueue(encoder.encode(streamLine({ type: 'delta', content: chunk })))
                    streamUsed = true
                  }
                  break
                }
                if (provider === 'nim') {
                  for await (const chunk of chatWithNIMStream(messages, { systemPrompt, temperature: 0.8, maxTokens: 1024 })) {
                    fullContent += chunk
                    controller.enqueue(encoder.encode(streamLine({ type: 'delta', content: chunk })))
                    streamUsed = true
                  }
                  break
                }
                if (provider === 'openrouter') {
                  const orMessages = buildOpenRouterMessages(systemPrompt, messages)
                  const { text } = await chatWithOpenRouter(orMessages, { temperature: 0.8, maxTokens: 1024 })
                  fullContent = text
                  controller.enqueue(encoder.encode(streamLine({ type: 'delta', content: text })))
                  streamUsed = true
                  break
                }
              } catch (err) {
                lastErr = err
                continue
              }
            }
            if (!streamUsed && lastErr) throw lastErr
            recordApiCall({ endpoint: 'chat', model: streamUsed ? 'groq-or-nim-stream' : 'stream-fail', success: true, latencyMs: Date.now() - startMs })
            const similarQuestions = await getSimilarQuestions(fullContent, lastUser)
            controller.enqueue(encoder.encode(streamLine({ type: 'done', similarQuestions })))
            /** P3-64：fire-and-forget 寫入 chat_history */
            userPromise.then((u) => void persistChatHistory(u?.id, lastUserStr, fullContent))
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err)
            const isAbort = err instanceof Error && err.name === 'AbortError'
            const isRateLimit = /rate limit|429/i.test(errMsg)
            logger.error('Chat stream error', { endpoint: 'chat', stream: true, message: errMsg })
            recordApiCall({ endpoint: 'chat', model: 'stream', success: false, latencyMs: Date.now() - startMs })
            /** P3-39：串流錯誤帶 code、retryable 供前端決定是否重試 */
            const code = isRateLimit ? 'RATE_LIMIT' : isAbort ? 'TIMEOUT' : 'UPSTREAM_ERROR'
            const retryable = isAbort || /5\d{2}|network|fetch/i.test(errMsg)
            controller.enqueue(encoder.encode(streamLine({
              type: 'error',
              message: '串流發生錯誤，請稍後再試。',
              code,
              retryable,
            })))
          } finally {
            controller.close()
          }
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
      })
    }

    let responseMessage: string
    let usedModel = 'offline'
    try {
      const result = await chatWithGroqOrFallback(messages, contextWithRag, startMs)
      responseMessage = result.message
      usedModel = result.model
    } catch (apiError) {
      responseMessage = OFFLINE_FALLBACK_REPLIES[Math.floor(Math.random() * OFFLINE_FALLBACK_REPLIES.length)]
      recordApiCall({ endpoint: 'chat', model: 'offline-fallback', success: true, latencyMs: Date.now() - startMs })
    }
    const similarQuestions = await getSimilarQuestions(responseMessage, lastUser)
    setCached(lastUser, subscriptionTier, { message: responseMessage, sources, similarQuestions })
    if (shouldLongCache(lastUserStr)) {
      setLongCached(lastUserStr, subscriptionTier, { message: responseMessage, sources, similarQuestions })
    }
    const { text: messageText, wines } = parseWinesFromResponse(responseMessage)

    /** P3-64：fire-and-forget 寫入 chat_history，不阻塞回應 */
    userPromise.then((u) => void persistChatHistory(u?.id, lastUserStr, responseMessage))

    return NextResponse.json({
      message: messageText,
      wines: wines.length > 0 ? wines : undefined,
      sources,
      similarQuestions,
    })
  } catch (error) {
    /** EXPERT_60 P0：關鍵 API 錯誤監控 — 結構化 log，不含 PII */
    const errMsg = error instanceof Error ? error.message : String(error)
    logger.error('Chat API error', { endpoint: 'chat', message: errMsg })
    const fallback = OFFLINE_FALLBACK_REPLIES[Math.floor(Math.random() * OFFLINE_FALLBACK_REPLIES.length)]
    return NextResponse.json(
      { error: 'Failed to get response', message: fallback, code: 'UPSTREAM_ERROR', retryable: true },
      { status: 500 }
    )
  }
}
