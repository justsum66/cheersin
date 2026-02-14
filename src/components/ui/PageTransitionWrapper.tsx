'use client'

/** R2-039：頁面切換過渡 — AnimatePresence + pathname key 實現路由切換淡入淡出 */
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './PageTransition'

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={pathname}>{children}</PageTransition>
    </AnimatePresence>
  )
}
