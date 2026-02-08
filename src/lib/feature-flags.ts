/**
 * P2-274：Feature Flags — 以環境變數驅動功能開關，可擴充為 LaunchDarkly
 */

const env: Record<string, string | undefined> = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {}

function getBool(name: string): boolean {
  const v = env[`FEATURE_${name}`] ?? env[`NEXT_PUBLIC_FEATURE_${name}`]
  return v === '1' || v === 'true'
}

/** 客戶端可見（須 NEXT_PUBLIC_） */
export const clientFlags = {
  get aiQuickPrompts(): boolean {
    return getBool('AI_QUICK_PROMPTS')
  },
}

/** 服務端 */
export const serverFlags = {
  get useOpenRouterFallback(): boolean {
    return getBool('USE_OPENROUTER_FALLBACK')
  },
}
