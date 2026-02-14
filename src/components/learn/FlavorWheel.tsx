'use client'

/**
 * R2-380：風味輪互動 — 可點選/展開風味詞，資料來自 flavor-wheel.json
 */
import { useState, useMemo } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import flavorWheelData from '@/data/flavor-wheel.json'

type FlavorItem = { id: string; name: string; description: string }
type Category = { id: string; name: string; color: string; flavors: FlavorItem[] }
type Data = { categories: Category[] }

const data = flavorWheelData as Data

export function FlavorWheel() {
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorItem | null>(null)

  const categories = useMemo(() => data.categories ?? [], [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
            style={{ borderLeftColor: cat.color, borderLeftWidth: 4 }}
          >
            <h3 className="mb-3 font-medium text-white" style={{ color: cat.color }}>
              {cat.name}
            </h3>
            <ul className="space-y-1">
              {cat.flavors.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFlavor(f)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white games-focus-ring"
                  >
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedFlavor && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-lg font-semibold text-primary-300">{selectedFlavor.name}</h4>
                <p className="mt-2 text-sm text-white/80">{selectedFlavor.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlavor(null)}
                className="shrink-0 rounded-lg px-3 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              >
                關閉
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
