'use client'

/**
 * R2-382：酒款搜索 — 搜尋框+結果列表（名稱、簡介、類型/產區）
 */
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Wine, Search } from 'lucide-react'

type WineItem = {
  id: string
  name: string
  type?: string
  region?: string
  country?: string
  description?: string
  tags?: string[]
  variety?: string
}

export default function WinesSearchPage() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<WineItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWines = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const url = q ? `/api/learn/wines?q=${encodeURIComponent(q)}` : '/api/learn/wines'
      const res = await fetch(url)
      const json = await res.json()
      setItems(json.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchWines(query), 300)
    return () => clearTimeout(t)
  }, [query, fetchWines])

  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden /> 返回品酒學院
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Wine className="w-6 h-6 text-primary-400" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">酒款搜索</h1>
          <p className="text-white/60 text-sm">依名稱、產區、類型搜尋</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="輸入酒名、產區、類型…"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-white/50 text-sm">搜尋中…</p>
      ) : items.length === 0 ? (
        <p className="text-white/50 text-sm">無符合結果</p>
      ) : (
        <ul className="space-y-3">
          {items.map((w) => (
            <li
              key={w.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <h3 className="font-medium text-white">{w.name}</h3>
              <p className="text-white/50 text-xs mt-1">
                {[w.type, w.region, w.country].filter(Boolean).join(' · ')}
              </p>
              {w.description && (
                <p className="text-white/70 text-sm mt-2 line-clamp-2">{w.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
