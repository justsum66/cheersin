'use client'

import { useState, useEffect, useRef } from 'react'
import { m, useReducedMotion } from 'framer-motion'

interface TypingAnimationProps {
  /** 要顯示的文字 */
  text: string
  /** 打字速度 (毫秒/字元) */
  speed?: number
  /** 是否啟用光標閃爍 */
  showCursor?: boolean
  /** 光標符號 */
  cursorChar?: string
  /** 打字完成後的延遲 (毫秒) */
  delayAfter?: number
  /** 是否循環播放 */
  loop?: boolean
  /** 完成回呼 */
  onComplete?: () => void
  /** 類名 */
  className?: string
}

/**
 * D1. AI聊天載入動畫 - 打字機效果模擬元件
 * 模擬真實的打字體驗，增強AI回覆的真實感
 */
export function TypingAnimation({
  text,
  speed = 30,
  showCursor = true,
  cursorChar = '▋',
  delayAfter = 1000,
  loop = false,
  onComplete,
  className = ''
}: TypingAnimationProps) {
  const reducedMotion = useReducedMotion()
  const [displayText, setDisplayText] = useState('')
  const [showCursorState, setShowCursorState] = useState(true)
  const [isTyping, setIsTyping] = useState(true)
  const indexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loopRef = useRef(0)

  // 光標閃爍效果
  useEffect(() => {
    if (!showCursor || reducedMotion) return

    const cursorInterval = setInterval(() => {
      setShowCursorState(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [showCursor, reducedMotion])

  // 打字效果
  useEffect(() => {
    if (reducedMotion) {
      // 無動畫模式下直接顯示完整文字
      setDisplayText(text)
      setIsTyping(false)
      onComplete?.()
      return
    }

    // 重置狀態
    setDisplayText('')
    setIsTyping(true)
    indexRef.current = 0
    loopRef.current = 0

    const typeNext = () => {
      if (indexRef.current < text.length) {
        setDisplayText(prev => prev + text[indexRef.current])
        indexRef.current++
        
        // 隨機化打字速度，模擬真實打字
        const randomSpeed = speed * (0.8 + Math.random() * 0.4)
        timeoutRef.current = setTimeout(typeNext, randomSpeed)
      } else {
        // 打字完成
        setIsTyping(false)
        onComplete?.()
        
        // 如果啟用循環，延遲後重新開始
        if (loop) {
          timeoutRef.current = setTimeout(() => {
            loopRef.current++
            if (loopRef.current < 3) { // 限制循環次數
              setDisplayText('')
              indexRef.current = 0
              setIsTyping(true)
              typeNext()
            }
          }, delayAfter)
        }
      }
    }

    // 開始打字
    timeoutRef.current = setTimeout(typeNext, 100)

    // 清理函數
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed, loop, delayAfter, reducedMotion, onComplete])

  // 清理計時器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="font-medium">
        {displayText}
        {isTyping && showCursor && showCursorState && (
          <m.span
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-primary-400 ml-0.5"
          >
            {cursorChar}
          </m.span>
        )}
      </span>
      
      {/* 打字音效視覺反饋 */}
      {isTyping && !reducedMotion && (
        <m.span
          className="absolute -right-2 top-0 text-xs text-primary-400/50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 0.1
          }}
        >
          •
        </m.span>
      )}
    </div>
  )
}

interface TypingIndicatorProps {
  /** 顯示的文字 */
  text?: string
  /** 動畫速度 */
  speed?: 'slow' | 'normal' | 'fast'
  /** 類型：thinking, typing, loading */
  type?: 'thinking' | 'typing' | 'loading'
  /** 類名 */
  className?: string
}

/**
 * AI思考/打字指示器
 * 顯示AI正在處理或打字的狀態
 */
export function TypingIndicator({
  text = "AI正在思考中...",
  speed = 'normal',
  type = 'thinking',
  className = ''
}: TypingIndicatorProps) {
  const reducedMotion = useReducedMotion()
  const speedMap = {
    slow: 1.5,
    normal: 1,
    fast: 0.5
  }

  const getIndicator = () => {
    switch (type) {
      case 'typing':
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <m.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary-400"
                  animate={reducedMotion ? {} : {
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.6 * speedMap[speed],
                    repeat: Infinity,
                    delay: i * 0.2 * speedMap[speed],
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-white/70">{text}</span>
          </div>
        )
      
      case 'loading':
        return (
          <div className="flex items-center gap-3">
            <m.div
              className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full"
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{
                duration: 1 * speedMap[speed],
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <span className="text-sm text-white/70">{text}</span>
          </div>
        )
      
      case 'thinking':
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <m.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400"
                  animate={reducedMotion ? {} : {
                    y: [0, -8, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 0.8 * speedMap[speed],
                    repeat: Infinity,
                    delay: i * 0.15 * speedMap[speed],
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <TypingAnimation 
              text={text}
              speed={50 * speedMap[speed]}
              showCursor={true}
              className="text-sm text-white/70"
            />
          </div>
        )
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      {getIndicator()}
    </div>
  )
}

// 預設導出
export default TypingAnimation