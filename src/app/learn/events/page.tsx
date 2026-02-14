'use client'

/** R2-390：活動日曆 — 台灣品酒活動/展覽（靜態 JSON） */
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import eventsData from '@/data/events.json'

type Event = { id: string; title: string; date: string; location: string; type: string }
const events = eventsData.events as Event[]

export default function EventsPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring">
        <ChevronLeft className="w-4 h-4" /> 返回品酒學院
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">活動日曆</h1>
          <p className="text-white/60 text-sm">品酒活動與展覽</p>
        </div>
      </div>
      <ul className="space-y-4">
        {events.map((e) => (
          <li key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white">{e.title}</h3>
            <p className="text-white/60 text-sm mt-1">{e.date} · {e.location}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-300">{e.type}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
