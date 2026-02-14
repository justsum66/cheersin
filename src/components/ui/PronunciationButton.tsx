'use client'

import { useState, useRef, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

interface PronunciationButtonProps {
  text: string
  lang?: 'fr-FR' | 'it-IT' | 'de-DE' | 'es-ES' | 'en-US'
  className?: string
  size?: 'sm' | 'md'
}

/**
 * Phase 2 F2.1: 發音播放按鈕
 * 點擊播放法語/義大利語等術語的發音
 * 使用 Web Speech API 或 fallback 到免費 TTS 服務
 */
export function PronunciationButton({ 
  text, 
  lang = 'fr-FR', 
  className = '',
  size = 'sm'
}: PronunciationButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      // Stop playing
      window.speechSynthesis?.cancel()
      setIsPlaying(false)
      return
    }

    setError(false)
    setIsLoading(true)

    try {
      // Try Web Speech API first
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = 0.9 // Slightly slower for learning
        utterance.pitch = 1
        
        // Try to find a voice for the language
        const voices = window.speechSynthesis.getVoices()
        const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
        if (matchingVoice) {
          utterance.voice = matchingVoice
        }

        utterance.onstart = () => {
          setIsLoading(false)
          setIsPlaying(true)
        }
        
        utterance.onend = () => {
          setIsPlaying(false)
        }
        
        utterance.onerror = () => {
          setIsPlaying(false)
          setError(true)
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
      } else {
        throw new Error('Speech synthesis not supported')
      }
    } catch (e) {
      logger.error('Pronunciation failed', { err: e instanceof Error ? e.message : String(e) })
      setError(true)
      setIsLoading(false)
    }
  }, [text, lang, isPlaying])

  const langLabels: Record<string, string> = {
    'fr-FR': '法語',
    'it-IT': '義大利語',
    'de-DE': '德語',
    'es-ES': '西班牙語',
    'en-US': '英語',
  }

  const sizeClasses = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
  }

  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }

  return (
    <m.button
      type="button"
      onClick={handlePlay}
      disabled={isLoading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`${sizeClasses[size]} ${className} ${
        error 
          ? 'bg-red-500/20 text-red-400' 
          : isPlaying 
            ? 'bg-primary-500/30 text-primary-300' 
            : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15'
      } transition-colors inline-flex items-center justify-center`}
      title={`播放${langLabels[lang] ?? ''}發音：${text}`}
      aria-label={`播放「${text}」的發音`}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <m.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 className={`${iconSize[size]} animate-spin`} />
          </m.div>
        ) : error ? (
          <m.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <VolumeX className={iconSize[size]} />
          </m.div>
        ) : (
          <m.div
            key="play"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Volume2 className={`${iconSize[size]} ${isPlaying ? 'animate-pulse' : ''}`} />
          </m.div>
        )}
      </AnimatePresence>
    </m.button>
  )
}

/**
 * 帶發音按鈕的術語顯示元件
 */
interface PronounceableTermProps {
  term: string
  pronunciation?: string
  lang?: 'fr-FR' | 'it-IT' | 'de-DE' | 'es-ES' | 'en-US'
  className?: string
}

export function PronounceableTerm({ 
  term, 
  pronunciation,
  lang = 'fr-FR',
  className = '' 
}: PronounceableTermProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="underline decoration-dotted decoration-primary-500/60">
        {term}
      </span>
      <PronunciationButton 
        text={pronunciation || term} 
        lang={lang}
        size="sm"
      />
    </span>
  )
}
