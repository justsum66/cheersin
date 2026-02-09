'use client'

/**
 * R2-017：Cloudflare Turnstile 無感知真人驗證
 * 用於登入、註冊、忘記密碼表單，防機器人。
 * 未設定 NEXT_PUBLIC_TURNSTILE_SITE_KEY 時不渲染，表單仍可送出（開發/未上線）。
 */
import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const Turnstile = dynamic(
  () => import('react-turnstile').then((m) => m.Turnstile),
  { ssr: false }
)

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  /** 表單送出失敗時可 reset，讓用戶再驗證一次 */
  resetKey?: number
}

export function TurnstileWidget({ onVerify, onExpire, resetKey = 0 }: TurnstileWidgetProps) {
  const siteKey = useMemo(() => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '', [])

  if (!siteKey) return null

  return (
    <div className="flex justify-center my-4" aria-label="真人驗證">
      <Turnstile
        key={resetKey}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        theme="dark"
      />
    </div>
  )
}
