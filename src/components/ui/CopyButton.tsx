'use client'

/** P1-087：複製按鈕 — 點擊複製後圖標變打勾 + Toast 提示 */
import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/contexts/I18nContext'

export interface CopyButtonProps {
  text: string
  successMessage?: string
  className?: string
  'aria-label'?: string
}

export function CopyButton({
  text,
  successMessage,
  className = '',
  'aria-label': ariaLabel,
}: CopyButtonProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const resolvedSuccess = successMessage ?? t('common.copied')
  const resolvedAria = ariaLabel ?? t('common.copy')

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(resolvedSuccess)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('common.copyFailed'))
    }
  }, [text, resolvedSuccess, t])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-2 rounded-lg hover:bg-white/10 transition-colors games-focus-ring min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
      aria-label={resolvedAria}
    >
      {copied ? (
        <Check className="w-5 h-5 text-success" aria-hidden />
      ) : (
        <Copy className="w-5 h-5 text-white/70" aria-hidden />
      )}
    </button>
  )
}
