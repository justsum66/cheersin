import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { promises as dns } from 'node:dns'
import { normalizeEnv, normalizeUrl } from './env'

/** P3-33：模組級 lazy 單例，減少每請求新建連線（serverless 仍可能每 isolate 一實例）
 * P2-304：生產環境不輸出 debug；若需除錯可設 SUPABASE_DEBUG=1 並在 createSupabaseClient options 啟用 logLevel: 'debug' */
let serverClientSingleton: SupabaseClient | null = null

function createNewServerClient(): SupabaseClient {
    const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabaseServiceKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY || '')

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables')
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

/** Server 用 Supabase client 單例（lazy 建立）；連線數不隨請求數線性成長 */
export function getServerClient(): SupabaseClient {
    if (serverClientSingleton === null) {
        serverClientSingleton = createNewServerClient()
    }
    return serverClientSingleton
}

/** 相容既有呼叫；等同 getServerClient() */
export function createServerClient(): SupabaseClient {
    return getServerClient()
}

/** 可選 Server Client：env 未設定時回傳 null，用於可選持久化（如 api_calls、chat_history） */
export function createServerClientOptional(): SupabaseClient | null {
    try {
        return getServerClient()
    } catch {
        return null
    }
}

// Test Supabase connection (先直接 fetch 測網路，再測 client)
export async function testSupabaseConnection(): Promise<{
    success: boolean
    message: string
    tables?: string[]
}> {
    const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabaseServiceKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY || '')

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, message: 'Missing Supabase environment variables' }
    }

    // 0. DNS 預檢：若 ENOTFOUND 可明確指出是 DNS/專案暫停
    try {
        const u = new URL(supabaseUrl)
        const hostname = u.hostname
        await dns.lookup(hostname, { family: 4 })
    } catch (dnsErr: unknown) {
        const err = dnsErr as { code?: string; cause?: { code?: string }; message?: string }
        const code = err?.code || err?.cause?.code
        if (code === 'ENOTFOUND' || code === 'ENODATA') {
            const hostname = (() => { try { return new URL(supabaseUrl).hostname } catch { return supabaseUrl } })()
            return {
                success: false,
                message: `DNS lookup failed for "${hostname}". Project may be paused (Supabase Dashboard → Restore) or network blocking *.supabase.co.`,
            }
        }
    }

    // 1. 直接 fetch 測試 host 是否可達
    try {
        const probeUrl = `${supabaseUrl}/rest/v1/`
        const probeRes = await fetch(probeUrl, {
            method: 'HEAD',
            headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
        })
        if (!probeRes.ok && probeRes.status !== 404 && probeRes.status !== 405) {
            return {
                success: false,
                message: `Supabase host reachable but returned ${probeRes.status}. Check project paused or RLS.`,
            }
        }
    } catch (probeErr: unknown) {
        const err = probeErr as { cause?: { code?: string }; code?: string; message?: string }
        const cause = err?.cause?.code || err?.code || err?.message
        return {
            success: false,
            message: `fetch failed: ${err?.message || 'Unknown'}. Cause: ${cause || 'none'}. Check URL, DNS, firewall, or project paused.`,
        }
    }

    try {
        const supabase = getServerClient()

        // 2. Test with a simple query
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)

        if (error) {
            // Check if it's just "no rows" which is fine
            if (error.code === 'PGRST116') {
                return {
                    success: true,
                    message: 'Database connected (no rows in profiles table yet)'
                }
            }

            // Check if table doesn't exist
            if (error.code === '42P01') {
                return {
                    success: true,
                    message: 'Database connected. Schema not yet applied (run supabase/schema.sql).'
                }
            }

            throw error
        }

        return {
            success: true,
            message: `Database connected. Profiles table accessible.`
        }
    } catch (error: unknown) {
        const err = error as { message?: string; details?: string }
        return {
            success: false,
            message: err?.message || err?.details || (typeof error === 'object' && error !== null ? JSON.stringify(error) : 'Unknown error')
        }
    }
}
