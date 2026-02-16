'use client'

/** P1-097：通用可摺疊 (Accordion) 組件 — FAQ、課程章節等 */
import { useState, type ReactNode } from 'react'
import { m, AnimatePresence } from 'framer-motion'

export interface AccordionItemProps {
  id: string
  trigger: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export interface AccordionProps {
  items: AccordionItemProps[]
  /** 是否只允許單一展開 */
  single?: boolean
  className?: string
}

export function AccordionItem({ id, trigger, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        id={`accordion-${id}-trigger`}
        aria-expanded={open}
        aria-controls={`accordion-${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 py-4 text-left text-white/90 hover:text-white transition-colors min-h-[44px] games-focus-ring rounded"
      >
        {trigger}
        <span className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={`accordion-${id}-panel`}
            role="region"
            aria-labelledby={`accordion-${id}-trigger`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-white/70 text-sm">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Accordion({ items, single = false, className = '' }: AccordionProps) {
  const defaultOpen = items.find((i) => i.defaultOpen)?.id ?? null
  const [openIds, setOpenIds] = useState<Set<string>>(defaultOpen ? new Set([defaultOpen]) : new Set())

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (single) next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className={className}>
      {items.map((item) => (
        <div key={item.id} className="border-b border-white/10 last:border-b-0">
          <button
            type="button"
            id={`accordion-${item.id}-trigger`}
            aria-expanded={openIds.has(item.id)}
            aria-controls={`accordion-${item.id}-panel`}
            onClick={() => toggle(item.id)}
            className="w-full flex items-center justify-between gap-2 py-4 text-left text-white/90 hover:text-white transition-colors min-h-[44px] games-focus-ring rounded"
          >
            {item.trigger}
            <span className={`shrink-0 transition-transform duration-200 ${openIds.has(item.id) ? 'rotate-180' : ''}`} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {openIds.has(item.id) && (
              <m.div
                id={`accordion-${item.id}-panel`}
                role="region"
                layout
                aria-labelledby={`accordion-${item.id}-trigger`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-4 text-white/70 text-sm">{item.children}</div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
