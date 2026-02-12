'use client'

import { useState, useCallback } from 'react'

const COPIED_RESET_MS = 2000

/**
 * 共用「複製邀請連結」邏輯：寫入剪貼簿、copied 狀態、可選 onCopied（例如 toast）、onCopyFail。
 * DC-07：複製邀請抽成 useCopyInvite，供 party-room、script-murder 使用。
 */
export function useCopyInvite(getUrl: () => string, onCopied?: () => void, onCopyFail?: () => void) {
  const [copied, setCopied] = useState(false)

  const copyInvite = useCallback(() => {
    const url = getUrl()
    if (!url) return
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), COPIED_RESET_MS)
    }).catch(() => {
      onCopyFail?.()
    })
  }, [getUrl, onCopied, onCopyFail])

  return { copyInvite, copied }
}
