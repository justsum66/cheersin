/**
 * 統一動畫主題系統
 * 提供一致的動畫配置和主題管理
 */

// 動畫主題配置
export interface AnimationTheme {
  /** 主題名稱 */
  name: string
  /** 動畫持續時間 */
  durations: {
    fast: number    // 150ms
    normal: number  // 300ms
    slow: number    // 500ms
    slowest: number // 800ms
  }
  /** 動畫緩動函數 */
  easings: {
    standard: string
    gentle: string
    bounce: string
    smooth: string
  }
  /** 動畫變形配置 */
  transforms: {
    scale: {
      small: number   // 0.95
      normal: number  // 1.0
      large: number   // 1.05
    }
    rotate: {
      small: number   // 5
      normal: number  // 15
      large: number   // 45
    }
  }
  /** 顏色主題 */
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
  }
  /** 陰影配置 */
  shadows: {
    small: string
    medium: string
    large: string
    glow: string
  }
}

// 預設主題
export const DEFAULT_THEMES: Record<string, AnimationTheme> = {
  // 現代簡約主題
  modern: {
    name: 'modern',
    durations: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5,
      slowest: 0.8
    },
    easings: {
      standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'ease-in-out'
    },
    transforms: {
      scale: {
        small: 0.95,
        normal: 1.0,
        large: 1.05
      },
      rotate: {
        small: 5,
        normal: 15,
        large: 45
      }
    },
    colors: {
      primary: '#8b0000',
      secondary: '#d4af37',
      accent: '#9333ea',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    shadows: {
      small: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(139, 0, 0, 0.3)'
    }
  },

  // 活潑動感主題
  vibrant: {
    name: 'vibrant',
    durations: {
      fast: 0.1,
      normal: 0.25,
      slow: 0.4,
      slowest: 0.6
    },
    easings: {
      standard: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      gentle: 'ease-out',
      bounce: 'cubic-bezier(0.5, 2, 0.5, 1)',
      smooth: 'ease-in-out'
    },
    transforms: {
      scale: {
        small: 0.9,
        normal: 1.0,
        large: 1.1
      },
      rotate: {
        small: 10,
        normal: 25,
        large: 90
      }
    },
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      success: '#96ceb4',
      warning: '#ffeaa7',
      error: '#ff7675'
    },
    shadows: {
      small: '0 2px 8px rgba(255, 107, 107, 0.2)',
      medium: '0 8px 20px rgba(78, 205, 196, 0.3)',
      large: '0 15px 30px rgba(69, 183, 209, 0.4)',
      glow: '0 0 30px rgba(255, 107, 107, 0.5)'
    }
  },

  // 優雅專業主題
  elegant: {
    name: 'elegant',
    durations: {
      fast: 0.2,
      normal: 0.4,
      slow: 0.7,
      slowest: 1.0
    },
    easings: {
      standard: 'cubic-bezier(0.23, 1, 0.32, 1)',
      gentle: 'ease-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'ease-in-out'
    },
    transforms: {
      scale: {
        small: 0.98,
        normal: 1.0,
        large: 1.02
      },
      rotate: {
        small: 2,
        normal: 8,
        large: 20
      }
    },
    colors: {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#667eea',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e'
    },
    shadows: {
      small: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
      large: '0 10px 25px rgba(0, 0, 0, 0.2)',
      glow: '0 0 15px rgba(102, 126, 234, 0.3)'
    }
  },

  // 深色主題
  dark: {
    name: 'dark',
    durations: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5,
      slowest: 0.8
    },
    easings: {
      standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      gentle: 'ease-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'ease-in-out'
    },
    transforms: {
      scale: {
        small: 0.95,
        normal: 1.0,
        large: 1.05
      },
      rotate: {
        small: 5,
        normal: 15,
        large: 45
      }
    },
    colors: {
      primary: '#1a202c',
      secondary: '#2d3748',
      accent: '#805ad5',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e'
    },
    shadows: {
      small: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      medium: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      glow: '0 0 20px rgba(128, 90, 213, 0.4)'
    }
  }
}

// 動畫變體配置
export interface AnimationVariant {
  /** 進入動畫 */
  enter: {
    opacity: number
    x?: number
    y?: number
    scale?: number
    rotate?: number
  }
  /** 退出動畫 */
  exit: {
    opacity: number
    x?: number
    y?: number
    scale?: number
    rotate?: number
  }
  /** 過渡配置 */
  transition: {
    duration: number
    ease: string
    delay?: number
  }
}

// 預設動畫變體
export const ANIMATION_VARIANTS: Record<string, AnimationVariant> = {
  // 淡入淡出
  fade: {
    enter: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  },

  // 滑入滑出
  slideUp: {
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      duration: 0.4, 
      ease: 'easeOut' 
    }
  },

  // 縮放效果
  scale: {
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  },

  // 彈跳效果
  bounce: {
    enter: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.9 },
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    }
  },

  // 翻轉效果
  flip: {
    enter: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 90 },
    transition: { 
      duration: 0.6, 
      ease: 'easeOut' 
    }
  }
}

// 動畫主題管理器
export class AnimationThemeManager {
  private static instance: AnimationThemeManager
  private currentTheme: AnimationTheme
  private subscribers: Array<(theme: AnimationTheme) => void> = []

  private constructor() {
    this.currentTheme = DEFAULT_THEMES.modern
  }

  static getInstance(): AnimationThemeManager {
    if (!AnimationThemeManager.instance) {
      AnimationThemeManager.instance = new AnimationThemeManager()
    }
    return AnimationThemeManager.instance
  }

  // 設定主題
  setTheme(themeName: string): void {
    if (DEFAULT_THEMES[themeName]) {
      this.currentTheme = DEFAULT_THEMES[themeName]
      this.notifySubscribers()
    }
  }

  // 取得目前主題
  getCurrentTheme(): AnimationTheme {
    return this.currentTheme
  }

  // 取得主題配置
  getThemeConfig(themeName: string): AnimationTheme | null {
    return DEFAULT_THEMES[themeName] || null
  }

  // 訂閱主題變更
  subscribe(callback: (theme: AnimationTheme) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // 通知訂閱者
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentTheme))
  }

  // 應用主題到元素
  applyTheme(element: HTMLElement, themeName?: string): void {
    const theme = themeName ? DEFAULT_THEMES[themeName] : this.currentTheme
    if (!theme) return

    element.style.setProperty('--animation-duration', `${theme.durations.normal}s`)
    element.style.setProperty('--animation-ease', theme.easings.standard)
    element.style.setProperty('--primary-color', theme.colors.primary)
    element.style.setProperty('--secondary-color', theme.colors.secondary)
    element.style.setProperty('--shadow-medium', theme.shadows.medium)
  }
}

// React Hook for theme management
import { useState, useEffect } from 'react'

export function useAnimationTheme() {
  const [theme, setTheme] = useState<AnimationTheme>(DEFAULT_THEMES.modern)
  const manager = AnimationThemeManager.getInstance()

  useEffect(() => {
    const unsubscribe = manager.subscribe(setTheme)
    return unsubscribe
  }, [manager])

  const changeTheme = (themeName: string) => {
    manager.setTheme(themeName)
  }

  return {
    theme,
    changeTheme,
    availableThemes: Object.keys(DEFAULT_THEMES)
  }
}

// CSS 變數生成器
export function generateThemeCSS(theme: AnimationTheme): string {
  return `
    :root {
      --animation-duration-fast: ${theme.durations.fast}s;
      --animation-duration-normal: ${theme.durations.normal}s;
      --animation-duration-slow: ${theme.durations.slow}s;
      --animation-duration-slowest: ${theme.durations.slowest}s;
      
      --animation-ease-standard: ${theme.easings.standard};
      --animation-ease-gentle: ${theme.easings.gentle};
      --animation-ease-bounce: ${theme.easings.bounce};
      --animation-ease-smooth: ${theme.easings.smooth};
      
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      
      --shadow-small: ${theme.shadows.small};
      --shadow-medium: ${theme.shadows.medium};
      --shadow-large: ${theme.shadows.large};
      --shadow-glow: ${theme.shadows.glow};
    }
  `
}

// 預設導出
export default {
  DEFAULT_THEMES,
  ANIMATION_VARIANTS,
  AnimationThemeManager,
  useAnimationTheme,
  generateThemeCSS
}