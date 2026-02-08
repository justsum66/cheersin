'use client'

import { useEffect, useCallback } from 'react'

/** P1-155：鍵盤快捷鍵 — 高頻操作（搜尋 /、返回 Esc） */
export interface ShortcutBinding {
  key: string
  ctrlOrMeta?: boolean
  handler: () => void
}

export function useKeyboardShortcuts(bindings: ShortcutBinding[], enabled = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return
      for (const { key, ctrlOrMeta, handler } of bindings) {
        const keyMatch = e.key.toLowerCase() === key.toLowerCase()
        const modMatch = ctrlOrMeta ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        if (keyMatch && modMatch && !isInputTarget(e.target)) {
          e.preventDefault()
          handler()
          return
        }
      }
    },
    [enabled, bindings]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

function isInputTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  const role = target.getAttribute('role')
  const isContentEditable = target.isContentEditable
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    role === 'textbox' ||
    role === 'searchbox' ||
    isContentEditable
  )
}

/** 預設快捷鍵：/ 聚焦搜尋、Esc 返回大廳（由調用方傳入 handler） */
export const DEFAULT_SHORTCUTS = {
  search: '/',
  escape: 'Escape',
} as const
