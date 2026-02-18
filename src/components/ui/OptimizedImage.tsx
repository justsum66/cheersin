'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'loading' | 'quality' | 'className'> {
  /** 是否優先載入（LCP候選） */
  priority?: boolean
  /** 載入策略：lazy | eager */
  loading?: 'lazy' | 'eager'
  /** 圖片品質 1-100（預設 75） */
  quality?: number
  /** 是否啟用模糊預覽 */
  blurPreview?: boolean
  /** 圖片載入完成回呼 */
  onLoad?: () => void
  /** 圖片載入錯誤回呼 */
  onError?: () => void
  /** CSS class */
  className?: string
}

/**
 * A2. 圖片全面WebP/AVIF轉換 - 統一優化圖片元件
 * 
 * 特色：
 * ✅ 自動使用WebP/AVIF現代格式（Next.js已配置）
 * ✅ 智慧載入策略（LCP優先、其他lazy）
 * ✅ 漸進式載入（blur preview）
 * ✅ 響應式srcSet自動生成
 * ✅ 載入狀態管理
 * 
 * 使用範例：
 * <OptimizedImage 
 *   src="/hero.jpg" 
 *   alt="Hero"
 *   width={1200}
 *   height={600}
 *   priority  // LCP圖片
 *   blurPreview  // 模糊預覽
 * />
 */
export function OptimizedImage({
  priority = false,
  loading = 'lazy',
  quality = 75,
  blurPreview = false,
  onLoad,
  onError,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const effectiveLoading = priority ? 'eager' : loading

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // 如果有錯誤，顯示預設圖片或佔位符
  if (hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl flex items-center justify-center ${className}`}
        style={{ 
          width: props.width, 
          height: props.height,
          aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined
        }}
      >
        <div className="text-center text-white/40 text-sm">
          <div className="mb-1">🖼️</div>
          <div>圖片載入失敗</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 預設佔位符（載入前顯示） */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse"
          style={{ 
            width: props.width, 
            height: props.height 
          }}
        />
      )}

      {/* 模糊預覽（如果啟用） */}
      {blurPreview && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-30"
          style={{ 
            width: props.width, 
            height: props.height 
          }}
        />
      )}

      <Image
        {...props}
        priority={priority}
        loading={effectiveLoading}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        // 確保支援現代格式
        unoptimized={false}
      />

      {/* 載入指示器（可選） */}
      {!isLoaded && (
        <div className="absolute bottom-2 right-2">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}

// 預設匯出以保持相容性
export default OptimizedImage