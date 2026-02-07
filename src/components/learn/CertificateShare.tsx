'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Share2, Copy, Download, Check, Twitter, Instagram, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'

interface CertificateShareProps {
  courseTitle: string
  completedAt?: string
  userName?: string
  totalChapters: number
  quizScore?: number
  className?: string
}

/**
 * Phase 2 E1.2: 證書分享連結
 * 生成可分享的課程完成證書，支援下載與社群分享
 */
export function CertificateShare({
  courseTitle,
  completedAt,
  userName = '學習者',
  totalChapters,
  quizScore,
  className = '',
}: CertificateShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  // 生成分享連結（使用課程 ID 和完成日期編碼）
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/certificate?c=${encodeURIComponent(courseTitle)}&d=${completedAt || new Date().toISOString().slice(0,10)}`
    : ''

  // 複製連結
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  // 下載證書圖片
  const handleDownload = async () => {
    if (!certificateRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#0a0a1a',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `cheersin-certificate-${courseTitle.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Download failed:', e)
    }
    setDownloading(false)
  }

  // 分享到 Twitter
  const shareToTwitter = () => {
    const text = `我剛完成了「${courseTitle}」課程！🍷✨ 在 Cheers In 品酒學院持續學習中。`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  // 格式化日期
  const formattedDate = completedAt 
    ? new Date(completedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className={className}>
      {/* 觸發按鈕 */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-200"
      >
        <Award className="w-5 h-5" />
        <span className="font-medium">查看證書</span>
        <Share2 className="w-4 h-4 ml-1" />
      </motion.button>

      {/* 證書彈窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              {/* 證書本體 */}
              <div
                ref={certificateRef}
                className="p-8 rounded-2xl bg-gradient-to-br from-[#1a0a2e] via-[#0f0a1a] to-[#1a0a2e] border-2 border-amber-500/30 relative overflow-hidden"
              >
                {/* 背景裝飾 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-20 h-20 border border-amber-500/20 rounded-full" />
                  <div className="absolute bottom-4 right-4 w-32 h-32 border border-amber-500/10 rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/5 rounded-full" />
                </div>

                {/* 頂部裝飾 */}
                <div className="flex justify-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-amber-500/50" />
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-amber-500/50" />
                  </div>
                </div>

                {/* 標題 */}
                <h2 className="text-center text-amber-300/80 text-sm font-medium tracking-widest mb-2">
                  CERTIFICATE OF COMPLETION
                </h2>
                <h3 className="text-center text-white text-lg font-semibold mb-6">
                  課程完成證書
                </h3>

                {/* 內容 */}
                <div className="text-center mb-6">
                  <p className="text-white/60 text-sm mb-2">茲證明</p>
                  <p className="text-2xl font-bold text-white mb-2">{userName}</p>
                  <p className="text-white/60 text-sm mb-4">已成功完成</p>
                  <div className="inline-block px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xl font-bold text-amber-300">{courseTitle}</p>
                  </div>
                </div>

                {/* 統計 */}
                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-400">{totalChapters}</p>
                    <p className="text-white/50 text-xs">章節完成</p>
                  </div>
                  {quizScore !== undefined && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{quizScore}%</p>
                      <p className="text-white/50 text-xs">測驗分數</p>
                    </div>
                  )}
                </div>

                {/* 日期與標誌 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs mb-1">完成日期</p>
                    <p className="text-white/80 text-sm">{formattedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-bold text-lg">Cheers In</p>
                    <p className="text-white/40 text-xs">品酒學院</p>
                  </div>
                </div>

                {/* 底部裝飾 */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500/30" />
                    <Award className="w-4 h-4 text-amber-500/40" />
                    <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500/30" />
                  </div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>複製連結</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 transition-colors disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  <span>{downloading ? '生成中...' : '下載圖片'}</span>
                </button>
              </div>

              {/* 社群分享 */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={shareToTwitter}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">分享到 Twitter</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Instagram 需要透過 Story 分享，使用現有的 ShareToStory
                    alert('請使用上方的「分享到 IG Story」功能')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#F77737]/20 hover:from-[#833AB4]/30 hover:via-[#FD1D1D]/30 hover:to-[#F77737]/30 text-pink-400 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm">Instagram</span>
                </button>
              </div>

              {/* 關閉按鈕 */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full mt-3 py-2 text-white/50 hover:text-white text-sm transition-colors"
              >
                關閉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CertificateShare
