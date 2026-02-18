'use client'

import dynamic from 'next/dynamic'

/**
 * Client-only components that need ssr: false.
 * Next.js 15 disallows ssr:false in Server Components (layout.tsx),
 * so we wrap them here in a Client Component.
 */
const CommandPalette = dynamic(
  () => import('@/components/navigation/CommandPalette').then((m) => m.CommandPalette),
  { ssr: false },
)
const SwUpdatePrompt = dynamic(() => import('@/components/pwa/SwUpdatePrompt'), { ssr: false })
const InstallPrompt = dynamic(() => import('@/components/pwa/InstallPrompt'), { ssr: false })
const SwRegisterScript = dynamic(() => import('@/components/pwa/SwRegisterScript'), { ssr: false })

export default function ClientOnlyProviders() {
  return (
    <>
      <CommandPalette />
      <SwUpdatePrompt />
      <InstallPrompt />
      <SwRegisterScript />
    </>
  )
}
