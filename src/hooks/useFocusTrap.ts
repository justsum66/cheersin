'use client'

/** UX_LAYOUT_200 #59：多層選單時 focus trap — 焦點侷限在容器內，Tab/Shift+Tab 循環 */
import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent != null && !el.hasAttribute('disabled')
  )
}

export function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  const previousActiveRef = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active || !containerRef.current || e.key !== 'Tab') return
      const focusables = getFocusables(containerRef.current)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const current = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (current === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (current === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [active, containerRef]
  )

  useEffect(() => {
    if (!active || !containerRef.current) return
    previousActiveRef.current = document.activeElement as HTMLElement | null
    const focusables = getFocusables(containerRef.current)
    if (focusables.length > 0) focusables[0].focus()
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveRef.current?.focus?.()
    }
  }, [active, containerRef, handleKeyDown])
}
