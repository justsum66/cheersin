'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Link2 } from 'lucide-react'
import { getReadingListForCourse } from '@/config/learn-reading-list'
import { getCommonMistakes } from '@/config/learn-common-mistakes'
import { getReferencesForCourse } from '@/config/learn-references'

interface SupplementaryContentProps {
  courseId: string
}

/**
 * Supplementary content section including:
 * - Common mistakes
 * - Reading list (collapsible)
 * - References
 * - Course-specific placeholders (flavor wheel, recipe calculator, etc.)
 */
export function SupplementaryContent({ courseId }: SupplementaryContentProps) {
  const [readingListOpen, setReadingListOpen] = useState(true)

  const mistakes = getCommonMistakes(courseId)
  const reading = getReadingListForCourse(courseId)
  const refs = getReferencesForCourse(courseId)

  return (
    <>
      {/* P2.A1.3 常見錯誤觀念 */}
      {mistakes && (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h3 className="text-sm font-semibold text-amber-200 mb-2">{mistakes.title}</h3>
          <ul className="space-y-2">
            {mistakes.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/80">
                <span className="text-amber-400 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* P2.A4.1 延伸閱讀書單；P2.D2.2 摺疊/展開控制 */}
      {reading.length > 0 && (
        <div className="mt-6 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setReadingListOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 text-left games-focus-ring"
            aria-expanded={readingListOpen}
          >
            <h3 className="text-sm font-semibold text-white/90">延伸閱讀</h3>
            {readingListOpen ? (
              <ChevronUp className="w-5 h-5 text-white/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/50" />
            )}
          </button>
          {readingListOpen && (
            <ul className="space-y-2 px-4 pb-4">
              {reading.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-300 hover:text-primary-200 text-sm underline underline-offset-2"
                  >
                    {item.title}
                  </a>
                  {item.note && <span className="text-white/50 text-xs ml-2">{item.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* P2.A4.2 論文引用資料 */}
      {refs.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-white/60" />
            參考資料
          </h3>
          <ul className="space-y-1.5 text-sm text-white/70">
            {refs.map((r, i) => (
              <li key={i}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:underline">
                    {r.title}
                  </a>
                ) : (
                  <span>{r.title}</span>
                )}
                {r.authors && <span className="text-white/50"> — {r.authors}</span>}
                {r.year && <span className="text-white/50"> ({r.year})</span>}
                {r.note && <span className="text-white/50 text-xs ml-1">{r.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Course-specific placeholders */}
      {courseId === 'wine-basics' && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white/90 mb-1">風味輪對照圖</h3>
          <p className="text-white/50 text-xs">葡萄品種風味輪視覺化籌備中，敬請期待。</p>
        </div>
      )}

      {courseId === 'cocktail-basics' && (
        <>
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">配方計算器</h3>
            <p className="text-white/50 text-xs">可依人數調整份量的調酒計算器籌備中。</p>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">步驟 GIF 動圖</h3>
            <p className="text-white/50 text-xs">調酒步驟快速教學動圖籌備中。</p>
          </div>
        </>
      )}

      {courseId === 'whisky-101' && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white/90 mb-1">年份比較時間軸</h3>
          <p className="text-white/50 text-xs">陳年差異視覺化時間軸籌備中。</p>
        </div>
      )}

      {courseId === 'sake-intro' && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white/90 mb-1">精米步合對照</h3>
          <p className="text-white/50 text-xs">清酒精米步合互動式對照籌備中。</p>
        </div>
      )}

      {/* P2.F3.1 重點回顧音檔：籌備中 */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white/90 mb-1">重點回顧音檔</h3>
        <p className="text-white/50 text-xs">Podcast 與音檔籌備中，敬請期待。通勤時也能複習重點。</p>
      </div>
    </>
  )
}
