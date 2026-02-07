/**
 * API 使用記錄：Token 追蹤（96）、每日呼叫量/成功率/延遲（99）
 * 儲存：in-memory（必寫）+ 可選 Supabase api_calls；P2-28：寫入失敗時 log
 */

import { createServerClientOptional } from './supabase-server'
import { logger } from './logger'

export interface ApiCallRecord {
  id: string
  timestamp: number
  endpoint: string
  model: string
  success: boolean
  latencyMs: number
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  userId?: string
}

const store: ApiCallRecord[] = []
const MAX_RECORDS = 5000

function trimStore() {
  if (store.length > MAX_RECORDS) {
    store.splice(0, store.length - MAX_RECORDS)
  }
}

/** 非同步寫入 Supabase api_calls（不阻塞、失敗靜默；無 DB 型別時用斷言） */
function persistToSupabase(record: ApiCallRecord): void {
  const supabase = createServerClientOptional()
  if (!supabase) return
  const row = {
    endpoint: record.endpoint,
    model: record.model,
    success: record.success,
    latency_ms: record.latencyMs,
    prompt_tokens: record.promptTokens ?? null,
    completion_tokens: record.completionTokens ?? null,
    total_tokens: record.totalTokens ?? null,
    user_id: record.userId ?? null,
  }
  // Supabase schema not in generated types; cast via unknown to access .from().insert()
  type SupabaseInsert = { from: (t: string) => { insert: (r: object) => Promise<{ error: { message: string } | null }> } }
  void (supabase as unknown as SupabaseInsert).from('api_calls').insert(row).then(({ error }) => {
    if (error) logger.warn('Supabase api_calls persist failed', { endpoint: record.endpoint, message: error.message })
  })
}

export function recordApiCall(record: Omit<ApiCallRecord, 'id' | 'timestamp'>): void {
  const full: ApiCallRecord = {
    ...record,
    id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  }
  store.push(full)
  trimStore()
  persistToSupabase(full)
}

export function getUsageStats(): {
  byDay: Record<string, { calls: number; success: number; totalLatencyMs: number; totalTokens: number }>
  byModel: Record<string, { calls: number; success: number }>
  recent: ApiCallRecord[]
} {
  const byDay: Record<string, { calls: number; success: number; totalLatencyMs: number; totalTokens: number }> = {}
  const byModel: Record<string, { calls: number; success: number }> = {}
  const dayKeys = (d: number) => new Date(d).toISOString().slice(0, 10)

  for (const r of store) {
    const day = dayKeys(r.timestamp)
    if (!byDay[day]) byDay[day] = { calls: 0, success: 0, totalLatencyMs: 0, totalTokens: 0 }
    byDay[day].calls += 1
    if (r.success) byDay[day].success += 1
    byDay[day].totalLatencyMs += r.latencyMs
    byDay[day].totalTokens += r.totalTokens ?? 0

    if (!byModel[r.model]) byModel[r.model] = { calls: 0, success: 0 }
    byModel[r.model].calls += 1
    if (r.success) byModel[r.model].success += 1
  }

  const recent = [...store].reverse().slice(0, 50)
  return { byDay, byModel, recent }
}

/** P1-18：查詢最近 30 天、最多 5000 筆，避免全表掃描 */
const USAGE_DAYS_BACK = 30
const USAGE_MAX_ROWS = 5000

/** 從 Supabase api_calls 讀取並回傳 stats（Dashboard 持久化；有 DB 時以 DB 為準，避免重複計算） */
export async function getUsageStatsWithSupabase(): Promise<ReturnType<typeof getUsageStats>> {
  const base = getUsageStats()
  const supabase = createServerClientOptional()
  if (!supabase) return base

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - USAGE_DAYS_BACK)
    const { data: rows, error } = await supabase
      .from('api_calls')
      .select('id, timestamp, endpoint, model, success, latency_ms, prompt_tokens, completion_tokens, total_tokens')
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(USAGE_MAX_ROWS)

    if (error || !rows?.length) return base

    const dayKeys = (ts: string) => ts.slice(0, 10)
    const byDay: Record<string, { calls: number; success: number; totalLatencyMs: number; totalTokens: number }> = {}
    const byModel: Record<string, { calls: number; success: number }> = {}
    const recent: ApiCallRecord[] = []

    type Row = {
      id: string
      timestamp: string
      endpoint: string
      model: string
      success: boolean
      latency_ms: number
      prompt_tokens?: number
      completion_tokens?: number
      total_tokens?: number
    }
    for (const r of rows as Row[]) {
      const day = dayKeys(r.timestamp)
      if (!byDay[day]) byDay[day] = { calls: 0, success: 0, totalLatencyMs: 0, totalTokens: 0 }
      byDay[day].calls += 1
      if (r.success) byDay[day].success += 1
      byDay[day].totalLatencyMs += r.latency_ms
      byDay[day].totalTokens += r.total_tokens ?? (r.prompt_tokens ?? 0) + (r.completion_tokens ?? 0)
      if (!byModel[r.model]) byModel[r.model] = { calls: 0, success: 0 }
      byModel[r.model].calls += 1
      if (r.success) byModel[r.model].success += 1
      if (recent.length < 50) {
        recent.push({
          id: r.id,
          timestamp: new Date(r.timestamp).getTime(),
          endpoint: r.endpoint,
          model: r.model,
          success: r.success,
          latencyMs: r.latency_ms,
          promptTokens: r.prompt_tokens,
          completionTokens: r.completion_tokens,
          totalTokens: r.total_tokens,
        })
      }
    }
    return { byDay, byModel, recent }
  } catch {
    return base
  }
}
