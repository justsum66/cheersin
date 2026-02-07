'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Instagram, Download, X, Sparkles, Award } from 'lucide-react'

interface ShareToStoryProps {
  courseTitle: string
  completedAt?: string
  totalChapters: number
  onClose?: () => void
}

/**
 * Phase 2 E1.1: IG Story 分享模板
 * 生成適合 IG Story 的課程完成圖片
 */
export function ShareToStory({ 
  courseTitle, 
  completedAt,
  totalChapters,
  onClose 
}: ShareToStoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!cardRef.current) return
    setIsGenerating(true)
    
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        width: 540,
        height: 960,
      })
      
      const blob = await new Promise<Blob | null>((res) => 
        canvas.toBlob(res, 'image/png', 0.95)
      )
      
      if (!blob) throw new Error('Canvas conversion failed')
      
      // Try native share if available (mobile)
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        const file = new File([blob], `cheersin-${courseTitle.replace(/\s+/g, '-')}.png`, { 
          type: 'image/png' 
        })
        const shareData = { files: [file] }
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          setIsOpen(false)
          return
        }
      }
      
      // Fallback to download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cheersin-${courseTitle.replace(/\s+/g, '-')}.png`
      a.click()
      URL.revokeObjectURL(url)
      setIsOpen(false)
    } catch (e) {
      console.error('Share generation failed:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  const formattedDate = completedAt 
    ? new Date(completedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm font-medium transition-all shadow-lg hover:shadow-pink-500/25"
      >
        <Instagram className="w-4 h-4" />
        分享到 IG Story
      </button>

      {/* Modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Preview Card - IG Story format (9:16) */}
              <div 
                ref={cardRef}
                className="relative overflow-hidden rounded-2xl"
                style={{ 
                  width: '100%', 
                  aspectRatio: '9/16',
                  maxWidth: '270px',
                  margin: '0 auto'
                }}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0f0a1a] to-[#1a0a2e]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,0,78,0.4),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(78,0,139,0.3),transparent_50%)]" />
                
                {/* Decorative elements */}
                <div className="absolute top-8 left-8 w-24 h-24 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-8 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                  {/* Logo */}
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                      <span className="text-2xl font-bold text-white">CI</span>
                    </div>
                    <p className="mt-2 text-white/60 text-xs font-medium tracking-wider">CHEERSIN</p>
                  </div>
                  
                  {/* Achievement Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  {/* Title */}
                  <div className="mb-4">
                    <p className="text-white/60 text-sm mb-1">我完成了</p>
                    <h2 className="text-xl font-bold text-white leading-tight">{courseTitle}</h2>
                    <p className="text-primary-300 text-sm mt-1">{totalChapters} 個章節</p>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-8 px-6 py-2 rounded-full bg-white/10 border border-white/20">
                    <p className="text-white/80 text-xs">一起來學習品酒吧！</p>
                    <p className="text-primary-400 text-sm font-medium mt-0.5">cheersin.co</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="min-h-[48px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下載圖片
                    </>
                  )}
                </button>
              </div>
              
              <p className="mt-4 text-center text-white/40 text-xs">
                下載後可直接分享到 Instagram Story
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
