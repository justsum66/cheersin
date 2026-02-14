'use client'

import { useState, useEffect, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import Image from 'next/image'
import { logger } from '@/lib/logger'

interface ImageLightboxProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Phase 2 D2.3: 燈箱放大功能
 * 點擊圖片可全螢幕放大瀏覽
 */
export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Reset zoom and position when closed
  useEffect(() => {
    if (!isOpen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // Handle keyboard
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(3, z + 0.5))
      if (e.key === '-') setZoom(z => Math.max(0.5, z - 0.5))
      if (e.key === '0') { setZoom(1); setPosition({ x: 0, y: 0 }) }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.5))
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.5))
  
  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = alt.replace(/\s+/g, '-') + '.jpg'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      logger.error('Download failed', { err: e instanceof Error ? e.message : String(e) })
    }
  }

  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || zoom <= 1) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setPosition(prev => ({
      x: prev.x + (clientX - (prev.x || clientX)),
      y: prev.y + (clientY - (prev.y || clientY)),
    }))
  }, [isDragging, zoom])

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Control bar */}
          <m.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white/80 text-sm truncate max-w-[60%]">{alt}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 disabled:opacity-30 transition-colors"
                aria-label="縮小"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 disabled:opacity-30 transition-colors"
                aria-label="放大"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                aria-label="下載圖片"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                aria-label="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </m.div>

          {/* Image container */}
          <m.div
            className="relative max-w-[90vw] max-h-[90vh] cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleDrag}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleDrag}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg select-none"
              draggable={false}
              unoptimized
            />
          </m.div>

          {/* Instructions */}
          <m.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs"
          >
            滾輪或 +/- 縮放 · 拖曳移動 · Esc 關閉
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

interface ClickableImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

/**
 * 可點擊放大的圖片元件
 */
export function ClickableImage({ src, alt, width = 640, height = 480, className = '' }: ClickableImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative group cursor-zoom-in ${className}`}
        aria-label={`點擊放大：${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-contain"
          unoptimized
        />
        {/* Zoom indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
      <ImageLightbox
        src={src}
        alt={alt}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
