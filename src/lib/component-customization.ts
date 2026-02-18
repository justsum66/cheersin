/**
 * 自定義選項系統
 * 提供元件的可配置選項和設定管理
 */

// 自定義選項配置
export interface CustomizationOption {
  /** 選項ID */
  id: string
  /** 顯示名稱 */
  label: string
  /** 選項類型 */
  type: 'boolean' | 'number' | 'string' | 'select' | 'color' | 'range'
  /** 預設值 */
  defaultValue: any
  /** 當前值 */
  value?: any
  /** 選項描述 */
  description?: string
  /** 選擇型選項的可用值 */
  options?: Array<{ value: string | number; label: string }>
  /** 數值範圍 (for range type) */
  min?: number
  /** 數值範圍 (for range type) */
  max?: number
  /** 步長 (for range/number type) */
  step?: number
  /** 是否需要重啟才能生效 */
  requiresRestart?: boolean
  /** 相依的其他選項 */
  dependencies?: string[]
}

// 元件自定義配置
export interface ComponentCustomization {
  /** 元件名稱 */
  componentName: string
  /** 元件類型 */
  componentType: string
  /** 可自定義選項 */
  options: CustomizationOption[]
  /** 當前配置 */
  config: Record<string, any>
}

// 預設自定義選項
export const DEFAULT_CUSTOMIZATION_OPTIONS: Record<string, ComponentCustomization> = {
  // 卡片懸浮效果自定義
  enhancedCardHover: {
    componentName: 'EnhancedCardHover',
    componentType: 'ui',
    config: {
      variant: 'standard',
      tiltIntensity: 3,
      scaleIntensity: 1.05,
      enableLighting: true,
      enableGlow: true,
      animationDuration: 0.3,
      animationEasing: 'easeOut'
    },
    options: [
      {
        id: 'variant',
        label: '卡片樣式',
        type: 'select',
        defaultValue: 'standard',
        description: '選擇卡片的視覺樣式',
        options: [
          { value: 'standard', label: '標準' },
          { value: 'premium', label: '高級' },
          { value: 'glass', label: '玻璃' }
        ]
      },
      {
        id: 'tiltIntensity',
        label: '傾斜強度',
        type: 'range',
        defaultValue: 3,
        min: 0,
        max: 10,
        step: 0.5,
        description: '滑鼠懸浮時的傾斜效果強度'
      },
      {
        id: 'scaleIntensity',
        label: '縮放強度',
        type: 'range',
        defaultValue: 1.05,
        min: 1,
        max: 1.3,
        step: 0.05,
        description: '懸浮時的縮放效果'
      },
      {
        id: 'enableLighting',
        label: '啟用光影效果',
        type: 'boolean',
        defaultValue: true,
        description: '是否顯示動態光影效果'
      },
      {
        id: 'enableGlow',
        label: '啟用光暈效果',
        type: 'boolean',
        defaultValue: true,
        description: '是否顯示邊框光暈'
      },
      {
        id: 'animationDuration',
        label: '動畫持續時間',
        type: 'range',
        defaultValue: 0.3,
        min: 0.1,
        max: 1,
        step: 0.1,
        description: '動畫播放時間(秒)'
      }
    ]
  },

  // 打字機動畫自定義
  typingAnimation: {
    componentName: 'TypingAnimation',
    componentType: 'animation',
    config: {
      speed: 50,
      showCursor: true,
      cursorCharacter: '|',
      loop: false,
      delay: 0
    },
    options: [
      {
        id: 'speed',
        label: '打字速度',
        type: 'range',
        defaultValue: 50,
        min: 10,
        max: 200,
        step: 10,
        description: '每個字元的顯示間隔(毫秒)'
      },
      {
        id: 'showCursor',
        label: '顯示游標',
        type: 'boolean',
        defaultValue: true,
        description: '是否顯示閃爍游標'
      },
      {
        id: 'cursorCharacter',
        label: '游標字元',
        type: 'string',
        defaultValue: '|',
        description: '游標顯示的字元'
      },
      {
        id: 'loop',
        label: '循環播放',
        type: 'boolean',
        defaultValue: false,
        description: '是否重複播放動畫'
      },
      {
        id: 'delay',
        label: '開始延遲',
        type: 'range',
        defaultValue: 0,
        min: 0,
        max: 2000,
        step: 100,
        description: '動畫開始前的延遲時間(毫秒)'
      }
    ]
  },

  // 情緒表情自定義
  emotionEmoji: {
    componentName: 'EmotionEmoji',
    componentType: 'animation',
    config: {
      animation: 'bounce',
      size: 'md',
      interactive: true,
      animationSpeed: 1
    },
    options: [
      {
        id: 'animation',
        label: '動畫類型',
        type: 'select',
        defaultValue: 'bounce',
        description: '表情的動畫效果',
        options: [
          { value: 'bounce', label: '彈跳' },
          { value: 'pulse', label: '脈衝' },
          { value: 'wave', label: '波浪' },
          { value: 'spin', label: '旋轉' },
          { value: 'float', label: '漂浮' }
        ]
      },
      {
        id: 'size',
        label: '表情大小',
        type: 'select',
        defaultValue: 'md',
        description: '表情圖示的大小',
        options: [
          { value: 'sm', label: '小' },
          { value: 'md', label: '中' },
          { value: 'lg', label: '大' },
          { value: 'xl', label: '特大' }
        ]
      },
      {
        id: 'interactive',
        label: '啟用互動',
        type: 'boolean',
        defaultValue: true,
        description: '是否啟用點擊互動效果'
      },
      {
        id: 'animationSpeed',
        label: '動畫速度',
        type: 'range',
        defaultValue: 1,
        min: 0.5,
        max: 3,
        step: 0.1,
        description: '動畫播放速度倍率'
      }
    ]
  },

  // 進度條自定義
  shimmerProgressBar: {
    componentName: 'ShimmerProgressBar',
    componentType: 'ui',
    config: {
      variant: 'primary',
      height: 'md',
      shimmer: true,
      shimmerSpeed: 2,
      rounded: 'full'
    },
    options: [
      {
        id: 'variant',
        label: '顏色主題',
        type: 'select',
        defaultValue: 'primary',
        description: '進度條的顏色主題',
        options: [
          { value: 'primary', label: '主要' },
          { value: 'secondary', label: '次要' },
          { value: 'success', label: '成功' },
          { value: 'warning', label: '警告' },
          { value: 'danger', label: '危險' }
        ]
      },
      {
        id: 'height',
        label: '高度',
        type: 'select',
        defaultValue: 'md',
        description: '進度條的高度',
        options: [
          { value: 'sm', label: '小' },
          { value: 'md', label: '中' },
          { value: 'lg', label: '大' }
        ]
      },
      {
        id: 'shimmer',
        label: '啟用流光效果',
        type: 'boolean',
        defaultValue: true,
        description: '是否顯示流光動畫'
      },
      {
        id: 'shimmerSpeed',
        label: '流光速度',
        type: 'range',
        defaultValue: 2,
        min: 0.5,
        max: 5,
        step: 0.5,
        description: '流光動畫的播放速度(秒)'
      },
      {
        id: 'rounded',
        label: '圓角大小',
        type: 'select',
        defaultValue: 'full',
        description: '進度條的圓角程度',
        options: [
          { value: 'sm', label: '小' },
          { value: 'md', label: '中' },
          { value: 'lg', label: '大' },
          { value: 'full', label: '圓形' }
        ]
      }
    ]
  }
}

// 自定義設定管理器
export class CustomizationManager {
  private static instance: CustomizationManager
  private settings: Record<string, any> = {}
  private subscribers: Array<(component: string, settings: Record<string, any>) => void> = []

  private constructor() {
    // 從localStorage載入設定
    this.loadSettings()
  }

  static getInstance(): CustomizationManager {
    if (!CustomizationManager.instance) {
      CustomizationManager.instance = new CustomizationManager()
    }
    return CustomizationManager.instance
  }

  // 設定元件設定
  setComponentSettings(componentName: string, settings: Record<string, any>): void {
    this.settings[componentName] = { ...this.settings[componentName], ...settings }
    this.saveSettings()
    this.notifySubscribers(componentName, this.settings[componentName])
  }

  // 取得元件設定
  getComponentSettings(componentName: string): Record<string, any> {
    return this.settings[componentName] || {}
  }

  // 取得特定選項值
  getOptionValue(componentName: string, optionId: string): any {
    const componentSettings = this.settings[componentName] || {}
    return componentSettings[optionId]
  }

  // 重設元件設定
  resetComponentSettings(componentName: string): void {
    delete this.settings[componentName]
    this.saveSettings()
    this.notifySubscribers(componentName, {})
  }

  // 取得元件的完整自定義配置
  getComponentCustomization(componentName: string): ComponentCustomization | null {
    const defaultConfig = DEFAULT_CUSTOMIZATION_OPTIONS[componentName]
    if (!defaultConfig) return null

    return {
      ...defaultConfig,
      config: {
        ...defaultConfig.config,
        ...this.settings[componentName]
      }
    }
  }

  // 訂閱設定變更
  subscribe(callback: (component: string, settings: Record<string, any>) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // 載入設定
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('customization-settings')
      if (saved) {
        this.settings = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load customization settings:', error)
      this.settings = {}
    }
  }

  // 儲存設定
  private saveSettings(): void {
    try {
      localStorage.setItem('customization-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save customization settings:', error)
    }
  }

  // 通知訂閱者
  private notifySubscribers(component: string, settings: Record<string, any>): void {
    this.subscribers.forEach(callback => callback(component, settings))
  }

  // 匯出設定
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2)
  }

  // 匯入設定
  importSettings(settingsString: string): boolean {
    try {
      const newSettings = JSON.parse(settingsString)
      this.settings = { ...this.settings, ...newSettings }
      this.saveSettings()
      // 通知所有元件設定已更新
      Object.keys(newSettings).forEach(component => {
        this.notifySubscribers(component, newSettings[component])
      })
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }
}

// React Hook for component customization
import { useState, useEffect } from 'react'

export function useComponentCustomization(componentName: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const manager = CustomizationManager.getInstance()

  useEffect(() => {
    // 載入初始設定
    const componentSettings = manager.getComponentSettings(componentName)
    setSettings(componentSettings)

    // 訂閱設定變更
    const unsubscribe = manager.subscribe((component, newSettings) => {
      if (component === componentName) {
        setSettings(newSettings)
      }
    })

    return unsubscribe
  }, [componentName, manager])

  const updateSettings = (newSettings: Record<string, any>) => {
    manager.setComponentSettings(componentName, newSettings)
  }

  const resetSettings = () => {
    manager.resetComponentSettings(componentName)
  }

  const getCustomization = () => {
    return manager.getComponentCustomization(componentName)
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    getCustomization
  }
}

// 自定義選項工具函數
export const customizationUtils = {
  // 驗證設定值
  validateSetting: (option: CustomizationOption, value: any): boolean => {
    switch (option.type) {
      case 'boolean':
        return typeof value === 'boolean'
      case 'number':
      case 'range':
        return typeof value === 'number' && 
               (option.min === undefined || value >= option.min) &&
               (option.max === undefined || value <= option.max)
      case 'string':
        return typeof value === 'string'
      case 'select':
        return option.options?.some(opt => opt.value === value) || false
      case 'color':
        return typeof value === 'string' && /^#[0-9A-F]{6}$/i.test(value)
      default:
        return false
    }
  },

  // 格式化顯示值
  formatValue: (option: CustomizationOption, value: any): string => {
    switch (option.type) {
      case 'boolean':
        return value ? '開啟' : '關閉'
      case 'number':
      case 'range':
        return `${value}${option.type === 'range' ? ' (' + option.min + '-' + option.max + ')' : ''}`
      case 'select':
        const selected = option.options?.find(opt => opt.value === value)
        return selected?.label || String(value)
      default:
        return String(value)
    }
  },

  // 生成CSS類名
  generateClassNames: (settings: Record<string, any>): string => {
    return Object.entries(settings)
      .map(([key, value]) => `${key}-${value}`)
      .join(' ')
  }
}

// 預設導出
export default {
  DEFAULT_CUSTOMIZATION_OPTIONS,
  CustomizationManager,
  useComponentCustomization,
  customizationUtils
}