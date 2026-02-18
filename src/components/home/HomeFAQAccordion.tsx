'use client'

import { useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { TypewriterText } from '@/components/ui/TypewriterText'

export interface FAQItem {
  q: string
  a: string
}

/** HP-009：semantic <details>/<summary> — works without JS, native a11y */
export default function HomeFAQAccordion({ items }: { items: FAQItem[] }) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <TypewriterText text="常見問題" as="h3" reducedMotion={!!reducedMotion} className="text-sm font-medium text-white/60 mb-3" />
      <div className="space-y-2">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <summary
              className="flex items-center justify-between gap-3 games-touch-target px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors games-focus-ring rounded-xl cursor-pointer list-none [&::-webkit-details-marker]:hidden"
            >
              <span className="text-sm font-medium">{item.q}</span>
              <ChevronDown className="w-4 h-4 text-white/50 shrink-0 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="overflow-hidden animate-[faqOpen_0.2s_ease-out]">
              <p className="px-4 pb-3 pt-0 text-xs text-white/60 leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
