'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { PartyEmergencyButton } from '@/components/PartyEmergencyButton'
import { useTranslation } from '@/contexts/I18nContext'
import { Home, Gamepad2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NotFound() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) router.push(`/games?q=${encodeURIComponent(q)}`)
    else router.push('/games')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-[#0a0a1a]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-[#0a0a1a] to-[#0a0a1a]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-[120px] font-display font-bold leading-none gradient-text opacity-50 select-none">
            404
          </div>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          {t('notFound.title')}
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 text-lg mb-8"
        >
          {t('notFound.subtitle')}
        </m.p>

        {/* Actions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 items-center w-full"
        >
          {/* Party Emergency Button */}
          <div className="w-full max-w-xs">
            <p className="text-white/40 text-xs mb-2 uppercase tracking-widest">{t('notFound.hint')}</p>
            <PartyEmergencyButton />
          </div>

          {/* or Search */}
          <div className="w-full max-w-xs mt-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Find your game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link href="/games" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors">
              <Gamepad2 className="w-4 h-4" />
              {t('notFound.browse')}
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/60 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
              {t('notFound.back')}
            </Link>
          </div>
        </m.div>
      </div>
    </main>
  )
}
