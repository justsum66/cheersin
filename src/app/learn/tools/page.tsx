'use client'
/** R2-397：酒具介紹 — 酒杯、開瓶器、醒酒器 */
import Link from 'next/link'
import { ChevronLeft, Wine } from 'lucide-react'

const TOOLS = [
  { name: '酒杯', desc: '紅白酒杯、威士忌杯、香檳杯、ISO 品飲杯等，形狀影響香氣與口感。' },
  { name: '開瓶器', desc: '海馬刀、蝶形、電動等；海馬刀最通用。' },
  { name: '醒酒器', desc: '讓酒接觸空氣，柔化單寧、釋放香氣；年輕濃郁紅酒尤其適合。' },
]

export default function ToolsPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Wine className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">酒具介紹</h1>
          <p className="text-white/60 text-sm">酒杯、開瓶器、醒酒器</p>
        </div>
      </div>
      <ul className="space-y-4">
        {TOOLS.map((t) => (
          <li key={t.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white">{t.name}</h3>
            <p className="text-white/70 text-sm mt-1">{t.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
