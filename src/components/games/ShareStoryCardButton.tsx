'use client'

/**
 * P0-010：病毒式分享 — 一鍵生成故事卡片圖片（含結果文案、Cheersin Logo、網址），可分享至 IG/FB 或下載
 */

import { useRef, useCallback, useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { APP_NAME, OFFICIAL_HASHTAG } from '@/lib/constants'

const CARD_WIDTH = 405
const CARD_HEIGHT = 720

interface ShareStoryCardButtonProps {
  /** 結果主文案（如懲罰內容、真心話題目） */
  resultText: string
  /** 遊戲名稱（可選） */
  gameName?: string
  /** 副標（可選，如「懲罰輪盤」） */
  subtitle?: string
  /** 按鈕文字 */
  label?: string
  className?: string
}

export function ShareStoryCardButton({
  resultText,
  gameName,
  subtitle,
  label = '分享故事卡',
  className = '',
}: ShareStoryCardButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const handleShare = useCallback(async () => {
    const el = cardRef.current
    if (!el) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a1a',
        logging: false,
      })
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))
      if (!blob) throw new Error('Failed to create image')
      const file = new File([blob], `${APP_NAME}-story-${Date.now()}.png`, { type: 'image/png' })
      const url = typeof window !== 'undefined' ? window.location.origin : 'https://cheersin.app'
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: APP_NAME,
          text: resultText.slice(0, 100),
          url,
          files: [file],
        })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name
        a.click()
        URL.revokeObjectURL(a.href)
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') console.error('ShareStoryCard', e.message)
    } finally {
      setGenerating(false)
    }
  }, [resultText])

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cheersin.app'

  return (
    <>
      {/* 離屏繪製用，供 html2canvas 擷取 */}
      <div
        ref={cardRef}
        aria-hidden
        style={{
          position: 'absolute',
          left: -9999,
          top: 0,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a1a 50%, #0f172a 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <div>
          {gameName && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {gameName}
            </p>
          )}
          {subtitle && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{subtitle}</p>
          )}
          <p
            style={{
              fontSize: 22,
              lineHeight: 1.5,
              fontWeight: 600,
              color: '#f3e8ff',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {resultText}
          </p>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#c4b5fd', margin: '0 0 8px 0' }}>{APP_NAME}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{shareUrl}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0 0' }}>#{OFFICIAL_HASHTAG}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        disabled={generating}
        className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white/90 text-sm font-medium inline-flex items-center gap-2 games-focus-ring disabled:opacity-60 ${className}`}
        aria-label={label}
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
        {label}
      </button>
    </>
  )
}
