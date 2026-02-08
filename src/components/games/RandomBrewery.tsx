'use client'

import { useState, useEffect } from 'react'
import { Beer } from 'lucide-react'
import Link from 'next/link'

/**
 * Open Brewery DB 整合：隨機顯示一間酒廠，適合遊戲/探索情境
 */
type Brewery = {
  id: string
  name: string
  brewery_type: string
  city: string
  state_province: string
  country: string
  website_url: string | null
}

export default function RandomBrewery() {
  const [brewery, setBrewery] = useState<Brewery | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/breweries?random=1')
      .then((r) => r.json())
      .then((data) => {
        const list = data?.breweries
        if (Array.isArray(list) && list.length > 0) {
          setBrewery(list[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !brewery) return null

  return (
    <div className="rounded-xl bg-white/10 border border-white/20 p-4 text-left">
      <div className="flex items-center gap-2 text-amber-300 font-medium">
        <Beer className="w-5 h-5" aria-hidden />
        隨機酒廠
      </div>
      <p className="mt-1 text-white font-medium">{brewery.name}</p>
      <p className="text-white/70 text-sm">
        {[brewery.brewery_type, brewery.city, brewery.state_province, brewery.country]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {brewery.website_url && (
        <a
          href={brewery.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-primary-400 hover:underline"
        >
          官網
        </a>
      )}
      <Link href="/games" className="mt-2 block text-white/60 text-xs hover:text-white/80">
        更多派對遊戲 →
      </Link>
    </div>
  )
}
