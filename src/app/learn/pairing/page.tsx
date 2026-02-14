'use client'

/** R2-388：配餐指南 — 菜式→推薦酒款（靜態規則） */
import Link from 'next/link'
import { ChevronLeft, UtensilsCrossed } from 'lucide-react'
import pairingData from '@/data/food-pairing.json'

type Pairing = { dish: string; wines: string[]; note: string }
const pairings = pairingData.pairings as Pairing[]

export default function PairingPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring">
        <ChevronLeft className="w-4 h-4" /> 返回品酒學院
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">配餐指南</h1>
          <p className="text-white/60 text-sm">菜式與酒款搭配建議</p>
        </div>
      </div>
      <ul className="space-y-4">
        {pairings.map((p) => (
          <li key={p.dish} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white">{p.dish}</h3>
            <p className="text-primary-300 text-sm mt-1">{p.wines.join('、')}</p>
            <p className="text-white/60 text-xs mt-2">{p.note}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
