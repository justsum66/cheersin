/**
 * Task 1.03: Image Optimization Pipeline
 * Utility functions for image optimization, lazy loading, and format conversion
 */

/**
 * Generate blur placeholder for images
 */
export async function generateBlurDataURL(imageUrl: string): Promise<string> {
  try {
    // For external images, we can't generate blur data URLs
    if (imageUrl.startsWith('http')) {
      return ''
    }
    
    // For local images, Next.js handles this automatically
    return ''
  } catch (error) {
    console.warn('Failed to generate blur data URL:', error)
    return ''
  }
}

/**
 * Image loading strategy configuration
 */
export const IMAGE_LOADING_STRATEGIES = {
  // Critical images that should load immediately
  CRITICAL: {
    loading: 'eager' as const,
    priority: true,
    quality: 90,
    sizes: '(max-width: 768px) 100vw, 50vw'
  },
  
  // Hero images with high quality
  HERO: {
    loading: 'eager' as const,
    priority: true,
    quality: 85,
    sizes: '100vw'
  },
  
  // Content images with standard optimization
  CONTENT: {
    loading: 'lazy' as const,
    priority: false,
    quality: 75,
    sizes: '(max-width: 768px) 100vw, 50vw'
  },
  
  // Thumbnail images with lower quality
  THUMBNAIL: {
    loading: 'lazy' as const,
    priority: false,
    quality: 60,
    sizes: '150px'
  },
  
  // Avatar images with small size
  AVATAR: {
    loading: 'lazy' as const,
    priority: false,
    quality: 80,
    sizes: '64px'
  }
} as const

/**
 * Get optimized image configuration based on usage context
 */
export function getImageConfig(context: keyof typeof IMAGE_LOADING_STRATEGIES) {
  return IMAGE_LOADING_STRATEGIES[context]
}

/**
 * Calculate optimal image dimensions based on container size
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  const calculatedHeight = containerWidth / aspectRatio
  
  // Round to nearest 16px for better compression
  const width = Math.round(containerWidth / 16) * 16
  const height = Math.round(calculatedHeight / 16) * 16
  
  return { width, height }
}

/**
 * Generate responsive image sources for different screen densities
 */
export function generateResponsiveSources(
  baseSrc: string,
  widths: number[]
): { srcSet: string; sizes: string } {
  const srcSet = widths
    .map(width => `${baseSrc}?w=${width} ${width}w`)
    .join(', ')
  
  const sizes = widths
    .map((width, index) => {
      if (index === widths.length - 1) return `${width}px`
      return `(max-width: ${width}px) ${width}px`
    })
    .join(', ')
  
  return { srcSet, sizes }
}

/**
 * Image format detection and optimization
 */
export const IMAGE_FORMATS = {
  // Modern formats with better compression
  MODERN: ['avif', 'webp'],
  // Legacy formats for compatibility
  LEGACY: ['jpeg', 'png', 'gif'],
  // Vector formats
  VECTOR: ['svg']
} as const

/**
 * Get supported image formats for current browser
 */
export function getSupportedFormats(): string[] {
  if (typeof window === 'undefined') return ['webp', 'jpeg']
  
  const formats: string[] = []
  
  // Check for AVIF support
  if (window.CSS?.supports?.('image-format(avif)')) {
    formats.push('avif')
  }
  
  // Check for WebP support
  if (window.CSS?.supports?.('image-format(webp)')) {
    formats.push('webp')
  }
  
  // Always include JPEG as fallback
  formats.push('jpeg')
  
  return formats
}

/**
 * Optimize image URL with compression parameters
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: string
    fit?: 'cover' | 'contain' | 'fill'
  } = {}
): string {
  const { width, height, quality = 75, format = 'auto', fit = 'cover' } = options
  
  // For external image services
  if (url.includes('cloudinary.com')) {
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    if (quality) params.append('q', quality.toString())
    params.append('f', format)
    params.append('c', fit)
    
    return `${url}?${params.toString()}`
  }
  
  // For Supabase storage
  if (url.includes('supabase.co')) {
    // Supabase handles optimization automatically
    return url
  }
  
  // For local images, Next.js handles optimization
  return url
}

/**
 * Preload critical images for performance
 */
export async function preloadCriticalImages(imageUrls: string[]): Promise<void> {
  const preloadPromises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload: ${url}`))
      img.src = url
    })
  })
  
  try {
    await Promise.all(preloadPromises)
    console.log(`[Image Optimization] Preloaded ${imageUrls.length} critical images`)
  } catch (error) {
    console.warn('[Image Optimization] Some images failed to preload:', error)
  }
}

/**
 * Image performance monitoring
 */
export class ImagePerformanceMonitor {
  private metrics: Map<string, { loadTime: number; size: number }> = new Map()
  
  recordLoadTime(imageId: string, loadTime: number, size: number) {
    this.metrics.set(imageId, { loadTime, size })
  }
  
  getAverageLoadTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.loadTime)
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }
  
  getAverageSize(): number {
    const sizes = Array.from(this.metrics.values()).map(m => m.size)
    return sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0
  }
  
  getMetrics() {
    return {
      totalImages: this.metrics.size,
      averageLoadTime: this.getAverageLoadTime(),
      averageSize: this.getAverageSize(),
      metrics: Object.fromEntries(this.metrics)
    }
  }
}

// Global image performance monitor
export const imagePerformanceMonitor = new ImagePerformanceMonitor()