'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m , AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

/** T019 P2：Cookie 橫幅可拒絕、說明清楚、不強制同意才離開。拒絕後僅必要 cookie，隱私政策連結明顯。 */
const STORAGE_KEY = 'cookie_consent'
export type CookieConsentStatus = 'accepted' | 'rejected' | null

export function getCookieConsent(): CookieConsentStatus {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'accepted' || raw === 'rejected') return raw
  } catch {
    /* ignore */
  }
  return null
}

export function setCookieConsent(value: 'accepted' | 'rejected') {
  try {
    localStorage.setItem(STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: value }))
  } catch {
    /* ignore */
  }
}

export default function CookieConsentBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const status = getCookieConsent()
    if (status === null) setVisible(true)
  }, [])

  const handleAccept = () => {
    setCookieConsent('accepted')
    setVisible(false)
  }

  const handleReject = () => {
    setCookieConsent('rejected')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: '100%', opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-4 bg-[#0a0a1a]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]"
          role="dialog"
          aria-label={t('cookie.title')}
          aria-describedby="cookie-banner-desc"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Cookie className="w-6 h-6 text-primary-400 shrink-0 mt-0.5" aria-hidden />
              <div id="cookie-banner-desc">
                <p className="text-white/90 text-sm">{t('cookie.description')}</p>
                <Link
                  href="/privacy"
                  className="text-primary-400 hover:text-primary-300 text-sm underline underline-offset-2 mt-1 inline-block"
                >
                  {t('cookie.privacyLink')}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReject}
                className="btn-ghost min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 text-sm"
              >
                {t('cookie.decline')}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="btn-primary min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 text-sm"
              >
                {t('cookie.accept')}
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
