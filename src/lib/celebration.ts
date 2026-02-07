/**
 * 120 慶祝動畫：遊戲獲勝時全螢幕彩帶 + confetti 效果
 */
import confetti from 'canvas-confetti'

const COLORS = ['#8B0000', '#D4AF37', '#8A2BE2', '#FFD700', '#b91c1c']

/** 全螢幕慶祝：多發彩帶 + 中央爆發 */
export function fireFullscreenConfetti(): void {
  if (typeof window === 'undefined') return
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

/** 任務 25：失敗／平局效果 — 短震動 + 深色彩帶（可選） */
export function showFailureEffect(): void {
  if (typeof window === 'undefined') return
  if (window.navigator?.vibrate?.(200)) {
    setTimeout(() => window.navigator.vibrate?.(100), 250)
  }
  confetti({
    particleCount: 30,
    spread: 70,
    origin: { y: 0.5, x: 0.5 },
    colors: ['#4a0000', '#1a1a1a', '#2d2d2d'],
    scalar: 0.8,
  })
}
