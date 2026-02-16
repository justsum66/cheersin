'use client'

import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { getNote, setNote } from '@/lib/learn-notes'

interface ChapterNotesProps {
  courseId: string
  courseTitle: string
  chapterId: number
  value: string
  onChange: (value: string) => void
  onSaveIndicator?: (show: boolean) => void
  allChapters?: Array<{ id: number; title: string }>
}

export function ChapterNotes({
  courseId,
  courseTitle,
  chapterId,
  value,
  onChange,
  onSaveIndicator,
  allChapters = [],
}: ChapterNotesProps) {
  const [saveIndicator, setSaveIndicator] = useState(false)

  const handleChange = (text: string) => {
    // Phase 1 D3.4: 顯示筆記保存指示器
    setSaveIndicator(true)
    if (onSaveIndicator) onSaveIndicator(true)

    setNote(courseId, chapterId, text)
    onChange(text)

    // 保存完成後隱藏指示器
    setTimeout(() => {
      setSaveIndicator(false)
      if (onSaveIndicator) onSaveIndicator(false)
    }, 1000)
  }

  const handlePrint = () => {
    const printContent = allChapters
      .map((ch) => ({
        title: ch.title,
        note: getNote(courseId, ch.id) ?? '',
      }))
      .filter((x) => x.note.trim())

    if (printContent.length === 0) {
      toast('尚無筆記可列印')
      return
    }

    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>${courseTitle} - 品酒筆記</title>
      <style>body{font-family:system-ui;padding:2rem;max-width:720px;margin:0 auto;color:#333}
      h1{font-size:1.25rem;margin-bottom:1rem}.chapter{margin-bottom:1.5rem}
      .chapter h2{font-size:1rem;color:#666;margin-bottom:0.5rem}
      .chapter p{white-space:pre-wrap;font-size:0.9rem;line-height:1.6}
      @media print{body{padding:1rem}}</style></head><body>
      <h1>${courseTitle} · 品酒筆記</h1>
      ${printContent
        .map(
          (c) =>
            `<div class="chapter"><h2>${c.title}</h2><p>${c.note.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>`
        )
        .join('')}
      </body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 300)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-white/60 text-xs font-medium">我的筆記</label>
        <div className="flex items-center gap-2">
          {/* Phase 1 D3.4: 筆記自動保存指示器 */}
          <AnimatePresence>
            {saveIndicator && (
              <m.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-primary-400 text-xs"
              >
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" className="opacity-30" />
                    <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </m.div>
                已保存
              </m.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 games-focus-ring"
            title="列印筆記"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur()
        }}
        placeholder="寫下本章重點…"
        rows={3}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm resize-y min-h-[80px]"
      />
    </div>
  )
}
