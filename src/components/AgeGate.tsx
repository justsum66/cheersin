'use client'

/**
 * T015 P1：年齡門檻在首次進入 /games 時明確（含遊戲入口）
 * 僅首次進入 /games（或 /games/*）時顯示年齡確認；存於 cookie；i18n t('ageGate.*')
 */
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/contexts/I18nContext'

const COOKIE_NAME = 'cheersin_age_verified'
const COOKIE_MAX_AGE_YEARS = 1

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

/** SEC-22：生產環境 cookie 加 Secure，防明文傳輸 */
function setVerifiedCookie() {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365 * COOKIE_MAX_AGE_YEARS
  const secure = typeof window !== 'undefined' && window.location?.protocol === 'https:'
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'loading' | 'verified' | 'gate' | 'under18' | 'skip'>('loading')

  /** 僅在 /games、/script-murder、/party-room 路徑時才檢查年齡門檻（SM-58 Gate 元件） */
  const isAgeGatedRoute =
    (pathname?.startsWith('/games') ?? false) ||
    (pathname?.startsWith('/script-murder') ?? false) ||
    (pathname?.startsWith('/party-room') ?? false)

  useEffect(() => {
    if (!isAgeGatedRoute) {
      setStatus('skip')
      return
    }
    const value = getCookie(COOKIE_NAME)
    if (value === '1') {
      setStatus('verified')
      return
    }
    setStatus('gate')
  }, [isAgeGatedRoute])

  const handleConfirm = () => {
    setVerifiedCookie()
    setStatus('verified')
  }

  const handleUnder18 = () => {
    setStatus('under18')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]" aria-live="polite" aria-busy="true">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden />
      </div>
    )
  }

  if (status === 'skip' || status === 'verified') {
    return <>{children}</>
  }

  if (status === 'under18') {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a0a0a]/98 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-under18-title"
      >
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <h1 id="age-under18-title" className="text-2xl font-display font-bold text-white mb-4">
            {t('ageGate.under18Title')}
          </h1>
          <p className="text-white/70 mb-6">
            {t('ageGate.under18Desc')}
          </p>
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary min-h-[48px] inline-flex items-center justify-center px-8"
            aria-label={t('ageGate.leave')}
          >
            {t('ageGate.leave')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a0a0a]/98 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
    >
      <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center page-container-mobile">
        <h1 id="age-gate-title" className="text-2xl font-display font-bold text-white mb-2">
          {t('ageGate.title')}
        </h1>
        <p id="age-gate-desc" className="text-white/70 mb-6">
          {t('ageGate.desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary min-h-[48px] min-w-[44px] px-8"
            aria-label={t('ageGate.confirm')}
          >
            {t('ageGate.confirm')}
          </button>
          <button
            type="button"
            onClick={handleUnder18}
            className="btn-secondary min-h-[48px] min-w-[44px] px-8"
            aria-label={t('ageGate.under18')}
          >
            {t('ageGate.under18')}
          </button>
        </div>
        <p className="text-white/40 text-sm mt-6">
          {t('ageGate.disclaimer')}
        </p>
      </div>
    </div>
  )
}
