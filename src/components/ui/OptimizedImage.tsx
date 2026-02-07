'use client'

/**
 * Phase 1 E1.1: 圖片懶載及 blur placeholder
 * 統一的圖片組件，自動生成 blur placeholder
 */

import Image, { ImageProps } from 'next/image'
import { useState, useCallback, memo } from 'react'

/* 生成 shimmer SVG 作為 placeholder */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1a1a2e" offset="20%" />
      <stop stop-color="#2d2d44" offset="50%" />
      <stop stop-color="#1a1a2e" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1a1a2e" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

/* Base64 編碼 shimmer */
const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

/* 獲取 blur placeholder data URL */
export const getBlurDataURL = (width = 100, height = 100) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`

/* 單色 blur placeholder - 更輕量 */
const SOLID_BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxYTFhMmUiLz48L3N2Zz4='

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /** 使用動畫 shimmer 或靜態 blur */
  shimmerEffect?: boolean
  /** 淡入動畫持續時間 (ms) */
  fadeInDuration?: number
}

export const OptimizedImage = memo(function OptimizedImage({
  shimmerEffect = false,
  fadeInDuration = 300,
  className = '',
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true)
    onLoad?.(e)
  }, [onLoad])

  // 計算 placeholder
  const blurDataURL = shimmerEffect
    ? getBlurDataURL(
        typeof props.width === 'number' ? props.width : 100,
        typeof props.height === 'number' ? props.height : 100
      )
    : SOLID_BLUR

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through props
    <Image
      {...props}
      placeholder="blur"
      blurDataURL={blurDataURL}
      loading={props.loading ?? 'lazy'}
      onLoad={handleLoad}
      className={`${className} transition-opacity ${
        fadeInDuration > 0 ? `duration-${fadeInDuration}` : ''
      } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        ...props.style,
        transitionDuration: `${fadeInDuration}ms`,
      }}
    />
  )
})

export default OptimizedImage
