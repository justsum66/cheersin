'use client'

/** R2-380：風味輪 — 互動式風味詞探索 */
import Link from 'next/link'
import { ChevronLeft, Circle } from 'lucide-react'
import { FlavorWheel } from '@/components/learn/ui/FlavorWheel'

export default function FlavorWheelPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-4xl mx-auto">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        返回品酒學院
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Circle className="w-6 h-6 text-primary-400" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">風味輪</h1>
          <p className="text-white/60 text-sm">點選風味詞查看說明</p>
        </div>
      </div>

      <FlavorWheel />
    </div>
  )
}
