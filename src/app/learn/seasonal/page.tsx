'use client'
/** R2-392：季節推薦 — 依月份/季節靜態推薦酒款與飲用方式 */
import Link from 'next/link'
import { ChevronLeft, Sun } from 'lucide-react'

const SEASONS = [
  { season: '春', wines: ['白酒、粉紅酒、清酒'], tip: '清爽果香，戶外野餐適合' },
  { season: '夏', wines: ['氣泡酒、白酒、啤酒'], tip: '冰涼、低酒精、果香' },
  { season: '秋', wines: ['紅酒、橘酒、威士忌'], tip: '豐收感、辛香料與果乾' },
  { season: '冬', wines: ['紅酒、加烈酒、威士忌'], tip: '濃郁、溫暖、桶陳風味' },
]

export default function SeasonalPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Sun className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">季節推薦</h1>
          <p className="text-white/60 text-sm">依季節選酒與飲用方式</p>
        </div>
      </div>
      <ul className="space-y-4">
        {SEASONS.map((s) => (
          <li key={s.season} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white">{s.season}</h3>
            <p className="text-primary-300 text-sm mt-1">{s.wines.join('、')}</p>
            <p className="text-white/60 text-xs mt-2">{s.tip}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
