'use client'

import Image from 'next/image'
import { ClickableImage } from '@/components/ui/ImageLightbox'
import { parseContentWithTerms, ParsedTerm } from '@/lib/learn-terms'
import { PronunciationButton } from '@/components/ui/PronunciationButton'
import VideoPlayer from './VideoPlayer'

interface ChapterContentProps {
  title: string
  content: string
  videoUrl?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
}

export function ChapterContent({
  title,
  content,
  videoUrl,
  imageUrl,
  imageAlt,
}: ChapterContentProps) {
  return (
    <>
      {/* 156 影片播放器（有 videoUrl 時顯示） */}
      {videoUrl && (
        <div className="mb-4">
          <VideoPlayer src={videoUrl} title={title} />
        </div>
      )}

      {/* 31-40 章節圖片（產區地圖、酒標等） */}
      {/* Phase 1 E1.1: 圖片懶載及 blur placeholder */}
      {/* Phase 2 D2.3: 點擊放大燈箱功能 */}
      {imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3] max-h-[300px] relative">
          <ClickableImage
            src={imageUrl}
            alt={imageAlt || `${title} 示意圖`}
            width={640}
            height={480}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Phase 1 D3.1: 術語 tooltip 加強 - hover 效果優化 */}
      {/* Phase 2 F2.1: 法語/義大利語術語發音按鈕整合 */}
      <div className="mb-4 space-y-4">
        {(() => {
          const parts = (content || '').split(/\n\n+/).filter(Boolean)
          const paras = parts.length > 0 ? parts : [(content || '')]
          return paras.map((para, pi) => (
            <p key={pi} className="text-white/80 text-sm md:text-base leading-loose whitespace-pre-line games-body max-w-[65ch]">
              {parseContentWithTerms(para).map((node, ni) =>
                typeof node === 'string' ? (
                  node
                ) : (
                  <span
                    key={`${pi}-${ni}`}
                    className="inline-flex items-center gap-0.5"
                  >
                    <span
                      title={(node as ParsedTerm).en}
                      className="underline decoration-dotted decoration-primary-500/60 cursor-help hover:decoration-primary-400 hover:text-primary-300 transition-colors duration-200 hover:decoration-2"
                    >
                      {(node as ParsedTerm).term}
                    </span>
                    {/* Phase 2 F2.1: 發音按鈕 */}
                    {(node as ParsedTerm).pronunciation && (
                      <PronunciationButton
                        text={(node as ParsedTerm).pronunciation!.text}
                        lang={(node as ParsedTerm).pronunciation!.lang}
                        size="sm"
                        className="ml-0.5"
                      />
                    )}
                  </span>
                )
              )}
            </p>
          ))
        })()}
      </div>
    </>
  )
}
