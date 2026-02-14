'use client'

/** R2-387：產區地圖 — 可點擊產區顯示名稱與簡介（沿用 InteractiveRegionMap） */
import Link from 'next/link'
import { ChevronLeft, MapPin } from 'lucide-react'
import { InteractiveRegionMap } from '@/components/learn/InteractiveRegionMap'

export default function RegionsMapPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-5xl mx-auto">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden /> 返回品酒學院
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary-400" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">產區地圖</h1>
          <p className="text-white/60 text-sm">點選產區查看名稱與簡介</p>
        </div>
      </div>

      <InteractiveRegionMap className="mt-6" />
    </div>
  )
}
