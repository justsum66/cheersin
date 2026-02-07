'use client'

import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { TOAST_COPY_SUCCESS, TOAST_COPY_ERROR } from '@/config/toast.config'

/** 複製文字到剪貼簿並顯示 toast。供各遊戲分享結果用；文案來自 toast.config 單一來源。 */
export function useCopyResult(): (text: string) => void {
  return useCallback((text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      toast.error(TOAST_COPY_ERROR)
      return
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success(TOAST_COPY_SUCCESS),
      () => toast.error(TOAST_COPY_ERROR)
    )
  }, [])
}
