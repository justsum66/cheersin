'use client'

import Link from 'next/link'
import { ERROR_NETWORK_RETRY_MESSAGE, ERROR_FALLBACK_TITLE } from '@/config/errors.config'

/** E52 / UX_LAYOUT_200 #100 / A11Y-015：錯誤邊界 fallback 可讀 — role=alert 與標題供螢幕閱讀器朗讀 */
export default function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center" role="alert" aria-live="assertive" aria-label={ERROR_FALLBACK_TITLE}>
      <p className="text-white/80 mb-2">{ERROR_FALLBACK_TITLE}</p>
      <p className="text-white/50 text-sm mb-4">{ERROR_NETWORK_RETRY_MESSAGE}</p>
      <div className="form-actions justify-center">
        <button type="button" onClick={() => window.location.reload()} className="btn-primary min-h-[48px] px-6" aria-label="重新整理頁面">
          再試一次
        </button>
        <Link href="/" className="btn-secondary min-h-[48px] px-6 inline-flex items-center justify-center">
          回首頁
        </Link>
      </div>
    </div>
  )
}
