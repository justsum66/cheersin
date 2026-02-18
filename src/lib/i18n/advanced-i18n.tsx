/**
 * Phase 3 Task 3.07: Advanced Internationalization Enhancer
 * Enhanced i18n with RTL support, language detection, and quality improvements
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react'
import type { ReactNode } from 'react'

export type LanguageCode = 'en' | 'zh-TW' | 'zh-CN' | 'ja' | 'ko' | 'yue'
export type TextDirection = 'ltr' | 'rtl'

export interface LanguageInfo {
  code: LanguageCode
  name: string
  nativeName: string
  direction: TextDirection
  isRTL: boolean
}

export interface I18nConfig {
  /** Default language */
  defaultLanguage?: LanguageCode
  /** Supported languages */
  supportedLanguages?: LanguageCode[]
  /** Enable automatic language detection */
  autoDetect?: boolean
  /** Enable RTL language support */
  rtlSupport?: boolean
  /** Storage key for language preference */
  storageKey?: string
}

export interface TranslationMessages {
  [key: string]: string | TranslationMessages
}

export interface I18nContextValue {
  currentLanguage: LanguageCode
  languageInfo: LanguageInfo
  isRTL: boolean
  direction: TextDirection
  t: (key: string, params?: Record<string, string | number>) => string
  changeLanguage: (language: LanguageCode) => void
  detectLanguage: () => LanguageCode
}

// Language information
export const LANGUAGE_INFO: Record<LanguageCode, LanguageInfo> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    isRTL: false
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    direction: 'ltr',
    isRTL: false
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    direction: 'ltr',
    isRTL: false
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    isRTL: false
  },
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    isRTL: false
  },
  'yue': {
    code: 'yue',
    name: 'Cantonese',
    nativeName: '粵語',
    direction: 'ltr',
    isRTL: false
  }
}

const DEFAULT_CONFIG: I18nConfig = {
  defaultLanguage: 'zh-TW',
  supportedLanguages: ['en', 'zh-TW', 'zh-CN', 'ja', 'ko', 'yue'],
  autoDetect: true,
  rtlSupport: true,
  storageKey: 'cheersin_language'
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export interface I18nProviderProps {
  children: ReactNode
  config?: I18nConfig
  messages?: Record<LanguageCode, TranslationMessages>
}

export function I18nProvider({ 
  children, 
  config = {}, 
  messages = {} as Record<LanguageCode, TranslationMessages> 
}: I18nProviderProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(mergedConfig.storageKey!)
        if (saved && mergedConfig.supportedLanguages?.includes(saved as LanguageCode)) {
          return saved as LanguageCode
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    // Auto-detect if enabled
    if (mergedConfig.autoDetect) {
      return detectBrowserLanguage(mergedConfig.supportedLanguages!)
    }
    
    return mergedConfig.defaultLanguage!
  })

  // Save language preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(mergedConfig.storageKey!, currentLanguage)
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [currentLanguage, mergedConfig.storageKey])

  // Auto-detect browser language
  const detectBrowserLanguage = useCallback((supportedLanguages: LanguageCode[]): LanguageCode => {
    if (typeof window === 'undefined' || !navigator.language) {
      return mergedConfig.defaultLanguage!
    }

    const browserLang = navigator.language.toLowerCase()
    
    // Exact match
    if (supportedLanguages.includes(browserLang as LanguageCode)) {
      return browserLang as LanguageCode
    }
    
    // Partial match (e.g., 'zh' matches 'zh-TW' or 'zh-CN')
    const partialMatch = supportedLanguages.find(lang => 
      browserLang.startsWith(lang.split('-')[0])
    )
    
    if (partialMatch) {
      return partialMatch
    }
    
    // Check for traditional vs simplified Chinese
    if (browserLang.startsWith('zh')) {
      // Check if user prefers traditional characters
      const isTraditional = browserLang.includes('tw') || browserLang.includes('hk') || browserLang.includes('mo')
      return isTraditional ? 'zh-TW' : 'zh-CN'
    }
    
    return mergedConfig.defaultLanguage!
  }, [mergedConfig.defaultLanguage])

  // Get translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const languageMessages = messages[currentLanguage] || {}
    let translation = getNestedValue(languageMessages, key) || key
    
    // Apply parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue))
      })
    }
    
    return translation
  }, [currentLanguage, messages])

  // Change language
  const changeLanguage = useCallback((language: LanguageCode) => {
    if (mergedConfig.supportedLanguages?.includes(language)) {
      setCurrentLanguage(language)
    }
  }, [mergedConfig.supportedLanguages])

  // Language context value
  const contextValue: I18nContextValue = {
    currentLanguage,
    languageInfo: LANGUAGE_INFO[currentLanguage],
    isRTL: LANGUAGE_INFO[currentLanguage].isRTL,
    direction: LANGUAGE_INFO[currentLanguage].direction,
    t,
    changeLanguage,
    detectLanguage: () => detectBrowserLanguage(mergedConfig.supportedLanguages!)
  }

  return (
    <I18nContext.Provider value={contextValue}>
      <div 
        dir={contextValue.direction}
        lang={currentLanguage}
        className={contextValue.isRTL ? 'rtl' : 'ltr'}
      >
        {children}
      </div>
    </I18nContext.Provider>
  )
}

// Helper function to get nested object values
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  return path.split('.').reduce<unknown>((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined
  }, obj) as string | undefined
}

// Language switcher component
export interface LanguageSwitcherProps {
  className?: string
  showNativeNames?: boolean
  showFlags?: boolean
}

export function LanguageSwitcher({ 
  className = '',
  showNativeNames = true,
  showFlags = false
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, t } = useI18n()
  const config = DEFAULT_CONFIG // In a real app, this would come from context
  
  const handleLanguageChange = (language: LanguageCode) => {
    changeLanguage(language)
  }

  const getLanguageFlag = (code: LanguageCode): string => {
    const flags: Record<LanguageCode, string> = {
      'en': '🇺🇸',
      'zh-TW': '🇹🇼',
      'zh-CN': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'yue': '🇭🇰'
    }
    return flags[code] || '🌐'
  }

  return (
    <div className={`language-switcher ${className}`}>
      <label htmlFor="language-select" className="sr-only">
        {t('i18n.languageSelectorLabel', { defaultValue: '選擇語言' })}
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
        className="language-select min-h-[48px] px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        aria-label={t('i18n.languageSelectorLabel', { defaultValue: '選擇語言' })}
      >
        {config.supportedLanguages?.map((langCode) => {
          const langInfo = LANGUAGE_INFO[langCode]
          return (
            <option key={langCode} value={langCode}>
              {showFlags && `${getLanguageFlag(langCode)} `}
              {showNativeNames ? langInfo.nativeName : langInfo.name}
            </option>
          )
        })}
      </select>
    </div>
  )
}

// RTL support utilities
export const rtlStyles = `
  /* RTL specific styles */
  .rtl {
    direction: rtl;
    text-align: right;
  }
  
  .rtl .language-switcher {
    direction: ltr;
    text-align: left;
  }
  
  /* Ensure icons and symbols remain left-to-right */
  .rtl [class*="icon"],
  .rtl [class*="symbol"],
  .rtl i,
  .rtl svg {
    direction: ltr;
  }
  
  /* Adjust layout for RTL */
  .rtl .flex-row {
    flex-direction: row-reverse;
  }
  
  .rtl .text-left {
    text-align: right;
  }
  
  .rtl .text-right {
    text-align: left;
  }
  
  .rtl .float-left {
    float: right;
  }
  
  .rtl .float-right {
    float: left;
  }
  
  .rtl .ml- {
    margin-right: ;
  }
  
  .rtl .mr- {
    margin-left: ;
  }
  
  .rtl .pl- {
    padding-right: ;
  }
  
  .rtl .pr- {
    padding-left: ;
  }
`

// Accessibility enhanced translation hook
export function useAccessibleTranslation() {
  const { t } = useI18n()
  
  const ta = useCallback((key: string, params?: Record<string, string | number>): {
    text: string
    'aria-label': string
  } => {
    const text = t(key, params)
    return {
      text,
      'aria-label': text
    }
  }, [t])
  
  return { ta }
}