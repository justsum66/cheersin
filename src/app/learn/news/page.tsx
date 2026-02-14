'use client'

/** R2-389：酒類新聞 — 靜態列表（可改接 RSS/API） */
import Link from 'next/link'
import { ChevronLeft, Newspaper } from 'lucide-react'
import newsData from '@/data/wine-news.json'

type Item = { id: string; title: string; date: string; summary: string; url?: string }
const items = newsData.items as Item[]

export default function WineNewsPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring">
        <ChevronLeft className="w-4 h-4" /> 返回品酒學院
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">酒類新聞</h1>
          <p className="text-white/60 text-sm">產業動態與品酒新知</p>
        </div>
      </div>
      <ul className="space-y-4">
        {items.map((n) => (
          <li key={n.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white">{n.title}</h3>
            <p className="text-white/60 text-sm mt-1">{n.summary}</p>
            <p className="text-white/40 text-xs mt-2">{n.date}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
