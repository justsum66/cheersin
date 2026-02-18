/**
 * P1-029: 第三方庫按需加載優化
 * 動態導入大型第三方庫以減少初始bundle大小
 */

// 按需加載的第三方庫配置
interface LazyLibraryConfig {
  /** 庫名稱 */
  name: string
  /** 動態導入函數 */
  importFn: () => Promise<any>
  /** 預加載條件 */
  preloadCondition?: () => boolean
  /** 預加載延遲(ms) */
  preloadDelay?: number
  /** 是否已預加載 */
  preloaded?: boolean
}

// 配置需要按需加載的第三方庫
const LAZY_LIBRARIES: Record<string, LazyLibraryConfig> = {
  // 圖表庫
  chart: {
    name: 'chart.js',
    importFn: async () => {
      try {
        // 使用動態導入避免 TypeScript 編譯錯誤
        const module = await eval(`import("${'chart.js'}")`)
        return module
      } catch (error) {
        console.warn('[LazyLibrary] Chart.js not available:', error)
        return null
      }
    },
    preloadCondition: () => {
      // 在統計頁面或需要圖表的頁面預加載
      if (typeof window === 'undefined') return false
      return window.location.pathname.includes('/stats') || 
             window.location.pathname.includes('/analytics')
    },
    preloadDelay: 2000
  },

  // 圖片處理庫
  imageCompression: {
    name: 'browser-image-compression',
    importFn: async () => {
      try {
        // 使用動態導入避免 TypeScript 編譯錯誤
        const module = await eval(`import("${'browser-image-compression'}")`)
        return module
      } catch (error) {
        console.warn('[LazyLibrary] browser-image-compression not available:', error)
        return null
      }
    },
    preloadCondition: () => {
      // 在需要上傳圖片的頁面預加載
      if (typeof window === 'undefined') return false
      return window.location.pathname.includes('/profile') ||
             window.location.pathname.includes('/upload')
    },
    preloadDelay: 1000
  },

  // PDF處理庫
  pdf: {
    name: 'pdfjs-dist',
    importFn: async () => {
      try {
        // 使用動態導入避免 TypeScript 編譯錯誤
        const module = await eval(`import("${'pdfjs-dist'}")`)
        return module
      } catch (error) {
        console.warn('[LazyLibrary] pdfjs-dist not available:', error)
        return null
      }
    },
    preloadCondition: () => {
      // 在需要PDF處理的頁面預加載
      if (typeof window === 'undefined') return false
      return window.location.pathname.includes('/documents') ||
             window.location.pathname.includes('/pdf')
    },
    preloadDelay: 3000
  },

  // 音頻處理庫
  audio: {
    name: 'tone',
    importFn: async () => {
      try {
        // 使用動態導入避免 TypeScript 編譯錯誤
        const module = await eval(`import("${'tone'}")`)
        return module
      } catch (error) {
        console.warn('[LazyLibrary] tone not available:', error)
        return null
      }
    },
    preloadCondition: () => {
      // 在遊戲頁面預加載
      if (typeof window === 'undefined') return false
      return window.location.pathname.includes('/games')
    },
    preloadDelay: 1500
  },

  // 地圖庫
  map: {
    name: 'leaflet',
    importFn: async () => {
      try {
        // 使用動態導入避免 TypeScript 編譯錯誤
        const module = await eval(`import("${'leaflet'}")`)
        return module
      } catch (error) {
        console.warn('[LazyLibrary] leaflet not available:', error)
        return null
      }
    },
    preloadCondition: () => {
      // 在需要地圖的頁面預加載
      if (typeof window === 'undefined') return false
      return window.location.pathname.includes('/location') ||
             window.location.pathname.includes('/map')
    },
    preloadDelay: 2500
  }
}

// 懶加載管理器
class LazyLibraryManager {
  private static instance: LazyLibraryManager
  private loadingPromises: Map<string, Promise<any>> = new Map()
  private loadedLibraries: Map<string, any> = new Map()

  private constructor() {
    this.setupPreloading()
  }

  static getInstance(): LazyLibraryManager {
    if (!LazyLibraryManager.instance) {
      LazyLibraryManager.instance = new LazyLibraryManager()
    }
    return LazyLibraryManager.instance
  }

  // 載入指定庫
  async loadLibrary(name: string): Promise<any> {
    // 如果已經載入，直接返回
    if (this.loadedLibraries.has(name)) {
      return this.loadedLibraries.get(name)
    }

    // 如果正在載入中，返回現有的Promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)
    }

    // 檢查配置是否存在
    const config = LAZY_LIBRARIES[name]
    if (!config) {
      throw new Error(`Library ${name} not configured for lazy loading`)
    }

    // 建立載入Promise
    const loadPromise = config.importFn().then((module) => {
      this.loadedLibraries.set(name, module)
      this.loadingPromises.delete(name)
      return module
    }).catch((error) => {
      this.loadingPromises.delete(name)
      throw error
    })

    this.loadingPromises.set(name, loadPromise)
    return loadPromise
  }

  // 預載入庫
  async preloadLibrary(name: string): Promise<void> {
    const config = LAZY_LIBRARIES[name]
    if (!config || config.preloaded) {
      return
    }

    try {
      await this.loadLibrary(name)
      config.preloaded = true
      console.log(`[LazyLibrary] Preloaded ${name}`)
    } catch (error) {
      console.warn(`[LazyLibrary] Failed to preload ${name}:`, error)
    }
  }

  // 設定預加載
  private setupPreloading(): void {
    if (typeof window === 'undefined') return

    // 使用 requestIdleCallback 在空閒時間預加載
    const schedulePreload = (window.requestIdleCallback || ((cb) => setTimeout(cb, 1000))) as typeof requestIdleCallback

    Object.entries(LAZY_LIBRARIES).forEach(([name, config]) => {
      if (config.preloadCondition?.()) {
        schedulePreload(() => {
          setTimeout(() => {
            this.preloadLibrary(name)
          }, config.preloadDelay || 1000)
        })
      }
    })
  }

  // 取得已載入的庫
  getLoadedLibrary(name: string): any {
    return this.loadedLibraries.get(name)
  }

  // 檢查庫是否已載入
  isLibraryLoaded(name: string): boolean {
    return this.loadedLibraries.has(name)
  }

  // 清除載入狀態（用於測試）
  clearCache(): void {
    this.loadingPromises.clear()
    this.loadedLibraries.clear()
    Object.values(LAZY_LIBRARIES).forEach(config => {
      config.preloaded = false
    })
  }
}

// React Hook for lazy library loading
import { useState, useEffect } from 'react'

export function useLazyLibrary(name: string) {
  const [library, setLibrary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const manager = LazyLibraryManager.getInstance()

  useEffect(() => {
    const load = async () => {
      if (manager.isLibraryLoaded(name)) {
        setLibrary(manager.getLoadedLibrary(name))
        return
      }

      setLoading(true)
      setError(null)

      try {
        const lib = await manager.loadLibrary(name)
        setLibrary(lib)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load library'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [name, manager])

  return { library, loading, error }
}

// 預載入所有符合條件的庫
export async function preloadAllLibraries(): Promise<void> {
  const manager = LazyLibraryManager.getInstance()
  const preloadPromises = Object.entries(LAZY_LIBRARIES)
    .filter(([name, config]) => config.preloadCondition?.() && !config.preloaded)
    .map(([name]) => manager.preloadLibrary(name))

  await Promise.allSettled(preloadPromises)
}

// 匯出配置和管理器
export type { LazyLibraryConfig }

// 預設導出
export default {
  useLazyLibrary,
  preloadAllLibraries,
  LazyLibraryManager
}