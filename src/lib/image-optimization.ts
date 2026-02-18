/**
 * A2. 圖片優化工具函數
 * 提供圖片格式檢測、最佳化建議、響應式srcSet生成等功能
 */

// 支援的現代圖片格式
const MODERN_FORMATS = ['webp', 'avif'] as const
type ModernFormat = typeof MODERN_FORMATS[number]

// 裝置斷點對應的圖片尺寸
const DEVICE_SIZES = {
  mobile: 320,
  tablet: 768,
  desktop: 1200,
  large: 1920
} as const

/**
 * 檢測瀏覽器是否支援現代圖片格式
 */
export function detectImageSupport(): ModernFormat[] {
  const supported: ModernFormat[] = []
  
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas')
    
    // 檢測WebP支援
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      supported.push('webp')
    }
    
    // 檢測AVIF支援（需要較新瀏覽器）
    try {
      if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
        supported.push('avif')
      }
    } catch (e) {
      // AVIF不支援，忽略錯誤
    }
  }
  
  return supported
}

/**
 * 生成響應式srcSet
 * @param baseSrc 基礎圖片路徑
 * @param sizes 不同尺寸的寬度陣列
 * @returns srcSet字串
 */
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  const ext = baseSrc.split('.').pop()?.toLowerCase() || 'jpg'
  const name = baseSrc.replace(/\.[^/.]+$/, '')
  
  return sizes.map(size => {
    // 如果是現代格式，使用對應的副檔名
    const format = MODERN_FORMATS.includes(ext as ModernFormat) ? ext : 'webp'
    return `${name}@${size}w.${format} ${size}w`
  }).join(', ')
}

/**
 * 生成sizes屬性
 * @param maxWidth 最大顯示寬度
 * @returns sizes字串
 */
export function generateSizes(maxWidth: number): string {
  if (maxWidth <= DEVICE_SIZES.mobile) {
    return '(max-width: 320px) 100vw, 320px'
  } else if (maxWidth <= DEVICE_SIZES.tablet) {
    return '(max-width: 768px) 100vw, 768px'
  } else if (maxWidth <= DEVICE_SIZES.desktop) {
    return '(max-width: 1200px) 100vw, 1200px'
  } else {
    return '(max-width: 1920px) 100vw, 1920px'
  }
}

/**
 * 圖片最佳化建議
 */
export interface ImageOptimizationReport {
  /** 原始檔案大小（bytes） */
  originalSize: number
  /** 建議的現代格式 */
  recommendedFormat: ModernFormat
  /** 預估壓縮後大小（bytes） */
  estimatedSize: number
  /** 預估節省百分比 */
  savingsPercentage: number
  /** 是否建議轉換 */
  shouldConvert: boolean
}

/**
 * 分析圖片並提供最佳化建議
 * @param fileName 檔案名稱
 * @param fileSize 檔案大小（bytes）
 * @param mimeType MIME類型
 */
export function analyzeImage(
  fileName: string, 
  fileSize: number, 
  mimeType: string
): ImageOptimizationReport {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const supportedFormats = detectImageSupport()
  
  // 預設建議WebP（廣泛支援）
  let recommendedFormat: ModernFormat = 'webp'
  
  // 如果支援AVIF且圖片較大，建議AVIF
  if (supportedFormats.includes('avif') && fileSize > 100000) { // > 100KB
    recommendedFormat = 'avif'
  }
  
  // 預估壓縮率
  const compressionRatio = recommendedFormat === 'avif' ? 0.4 : 0.6 // AVIF約60%壓縮, WebP約40%
  const estimatedSize = Math.round(fileSize * compressionRatio)
  const savingsPercentage = Math.round((1 - compressionRatio) * 100)
  
  return {
    originalSize: fileSize,
    recommendedFormat,
    estimatedSize,
    savingsPercentage,
    shouldConvert: !MODERN_FORMATS.includes(ext as ModernFormat) && fileSize > 50000 // > 50KB才建議轉換
  }
}

/**
 * 預載圖片
 * @param src 圖片路徑
 * @returns Promise
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 批量預載圖片
 * @param srcs 圖片路徑陣列
 * @returns Promise
 */
export async function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  const promises = srcs.map(src => preloadImage(src))
  return Promise.allSettled(promises).then(results => 
    results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<HTMLImageElement>).value)
  )
}

// 預設匯出
export default {
  detectImageSupport,
  generateSrcSet,
  generateSizes,
  analyzeImage,
  preloadImage,
  preloadImages
}