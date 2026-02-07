'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useAccordion } from '@/hooks/useAccordion'

export interface FAQItem {
  q: string
  a: string
}

/** Client：FAQ 折疊互動 — DEDUP #8 使用共用 useAccordion */
export default function HomeFAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useAccordion(null)

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-sm font-medium text-white/60 mb-3">常見問題</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            layout
            className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="w-full flex items-center justify-between gap-3 games-touch-target px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors games-focus-ring rounded-xl"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-medium">{item.q}</span>
              <motion.span
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-white/50" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-3 pt-0 text-xs text-white/60 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
