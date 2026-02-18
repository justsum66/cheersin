/**
 * 120 慶祝動畫：遊戲獲勝時全螢幕彩帶 + confetti 效果
 * P2-245：canvas-confetti 以動態 import 載入，減少主包體積
 */
const COLORS = ['#8B0000', '#D4AF37', '#8A2BE2', '#FFD700', '#b91c1c']

/** 動態載入 confetti，僅在需要時加載 */
async function getConfetti(): Promise<typeof import('canvas-confetti').default> {
  const mod = await import('canvas-confetti')
  return mod.default
}

/** 全螢幕慶祝：多發彩帶 + 中央爆發 */
export async function fireFullscreenConfetti(): Promise<void> {
  if (typeof window === 'undefined') return
  const confetti = await getConfetti()
  const duration = 2500
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: COLORS,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: COLORS,
    })
    confetti({
      particleCount: 8,
      spread: 80,
      origin: { y: 0.5, x: 0.5 },
      colors: COLORS,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  setTimeout(() => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: COLORS })
  }, 200)
}

/** R2-042：失敗／平局效果 — 短震動 + 深色彩帶 + 紅色閃爍疊加 */
/** 任務 25：失敗／平局效果 — 短震動 + 深色彩帶（可選）；P2-245 動態載入 confetti */
export async function showFailureEffect(): Promise<void> {
  if (typeof window === 'undefined') return
  if (window.navigator?.vibrate?.(200)) {
    setTimeout(() => window.navigator.vibrate?.(100), 250)
  }
  /** R2-042：失敗時全螢幕紅色閃爍疊加，強化情緒反饋 */
  showFailureFlash(600)
  const confetti = await getConfetti()
  confetti({
    particleCount: 30,
    spread: 70,
    origin: { y: 0.5, x: 0.5 },
    colors: ['#4a0000', '#1a1a1a', '#2d2d2d'],
    scalar: 0.8,
  })
}

/** R2-042：失敗全螢幕紅色閃爍 — 短暫疊加後淡出 */
function showFailureFlash(durationMs = 600): void {
  if (typeof document === 'undefined') return
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(139,0,0,0.25);pointer-events:none;opacity:0;transition:opacity 0.15s ease;'
  document.body.appendChild(el)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1'
    })
  })
  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => { if (el.isConnected) el.remove() }, 180)
  }, durationMs)
}

/** 供其他模組使用的 confetti 觸發（動態載入 canvas-confetti） */
export async function fireConfetti(options?: { particleCount?: number; origin?: { x?: number; y?: number }; colors?: string[] }): Promise<void> {
  if (typeof window === 'undefined') return
  const confetti = await getConfetti()
  confetti({
    particleCount: options?.particleCount ?? 80,
    spread: 80,
    origin: options?.origin ?? { y: 0.6 },
    colors: options?.colors ?? COLORS,
  })
}

/** P1-131：懲罰／惋惜全螢幕疊加 — 螢幕短暫變灰，強化情緒反饋 */
export function showPunishmentOverlay(durationMs = 800): void {
  if (typeof document === 'undefined') return
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(60,60,80,0.5);pointer-events:none;opacity:0;transition:opacity 0.25s ease;'
  document.body.appendChild(el)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1'
    })
  })
  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => { if (el.isConnected) el.remove() }, 280)
  }, durationMs)
}
