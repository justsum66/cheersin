'use client'

import Link from 'next/link'
import { ERROR_NETWORK_RETRY_MESSAGE, ERROR_FALLBACK_TITLE } from '@/config/errors.config'

/** E52 / UX_LAYOUT_200 #100：錯誤邊界 fallback — 重新整理、回首頁；任務 91 品牌聲調共用 config */
export default function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
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
