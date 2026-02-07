'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'

/** PERSONA T015：年齡門檻僅在「首次進入 /games」時顯示，不整站彈窗。 */
const STORAGE_KEY = 'cheersin_age_verified_games'

export function getAgeGatePassed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setAgeGatePassed(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

interface AgeGateProps {
  onConfirm: () => void
}

/** 首次進入 /games 時顯示的年齡確認 overlay；確認後寫入 session，本 session 不再顯示。 */
export default function AgeGate({ onConfirm }: AgeGateProps) {
  const handleConfirm = useCallback(() => {
    setAgeGatePassed()
    onConfirm()
  }, [onConfirm])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        // 不關閉：僅能選「我滿 18」或「離開」
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a1a]/95 px-4 safe-area-px safe-area-pb"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
    >
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-4 md:p-8 text-center shadow-xl">
        <h2 id="age-gate-title" className="text-xl font-display font-bold text-white mb-2">
          年齡確認
        </h2>
        <p id="age-gate-desc" className="text-white/70 text-sm mb-6">
          本區為酒桌派對遊戲，未滿 18 歲請勿使用。進入即表示您已滿法定飲酒年齡。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary min-h-[48px] min-w-[48px] px-6"
            aria-label="我滿 18 歲，進入遊樂場"
          >
            我滿 18 歲，進入
          </button>
          <Link
            href="/"
            className="btn-secondary min-h-[48px] min-w-[48px] px-6 inline-flex items-center justify-center"
            aria-label="離開，返回首頁"
          >
            離開
          </Link>
        </div>
      </div>
    </div>
  )
}
