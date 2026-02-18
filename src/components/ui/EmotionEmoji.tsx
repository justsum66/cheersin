'use client'

import { useState, useEffect } from 'react'
import { m, useReducedMotion } from 'framer-motion'

interface EmotionEmojiProps {
  /** 情緒類型 */
  emotion: 'happy' | 'excited' | 'surprised' | 'thoughtful' | 'confident' | 'curious' | 'cheerful' | 'professional'
  /** 動畫類型 */
  animation?: 'bounce' | 'pulse' | 'wave' | 'spin' | 'float'
  /** 大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否啟用互動效果 */
  interactive?: boolean
  /** 類名 */
  className?: string
}

/**
 * D2. AI回覆表情豐富化 - 情緒對應emoji動畫元件
 * 根據AI回覆內容的語氣和情緒顯示對應的emoji動畫
 */
export function EmotionEmoji({
  emotion,
  animation = 'bounce',
  size = 'md',
  interactive = true,
  className = ''
}: EmotionEmojiProps) {
  const reducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)
  const [triggerAnimation, setTriggerAnimation] = useState(false)

  // 情緒對應的emoji和顏色
  const emotionConfig = {
    happy: { emoji: '😊', color: 'text-yellow-400', label: '開心' },
    excited: { emoji: '🤩', color: 'text-orange-400', label: '興奮' },
    surprised: { emoji: '😮', color: 'text-blue-400', label: '驚訝' },
    thoughtful: { emoji: '🤔', color: 'text-purple-400', label: '思考' },
    confident: { emoji: '😎', color: 'text-green-400', label: '自信' },
    curious: { emoji: '🧐', color: 'text-cyan-400', label: '好奇' },
    cheerful: { emoji: '😄', color: 'text-pink-400', label: '愉快' },
    professional: { emoji: '👔', color: 'text-gray-400', label: '專業' }
  }

  const config = emotionConfig[emotion] || emotionConfig.happy
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  // 觸發動畫
  useEffect(() => {
    if (triggerAnimation) {
      const timer = setTimeout(() => setTriggerAnimation(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [triggerAnimation])

  // 動畫變體
  const getAnimationVariants = () => {
    if (reducedMotion) {
      return {
        initial: { scale: 1 },
        animate: { scale: 1 }
      }
    }

    switch (animation) {
      case 'pulse':
        return {
          initial: { scale: 1 },
          animate: { 
            scale: [1, 1.2, 1],
            transition: { 
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut" as const
            }
          }
        }
      
      case 'wave':
        return {
          initial: { rotate: 0 },
          animate: { 
            rotate: [0, 15, -15, 0],
            transition: { 
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut" as const
            }
          }
        }
      
      case 'spin':
        return {
          initial: { rotate: 0 },
          animate: { 
            rotate: 360,
            transition: { 
              duration: 2,
              repeat: Infinity,
              ease: "linear" as const
            }
          }
        }
      
      case 'float':
        return {
          initial: { y: 0 },
          animate: { 
            y: [-5, 5, -5],
            transition: { 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut" as const
            }
          }
        }
      
      case 'bounce':
      default:
        return {
          initial: { y: 0 },
          animate: triggerAnimation ? {
            y: [0, -15, 0],
            transition: { 
              duration: 0.5,
              ease: "easeOut" as const
            }
          } : {
            y: [0, -8, 0],
            transition: { 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut" as const
            }
          }
        }
    }
  }

  const handleInteraction = () => {
    if (interactive && !reducedMotion) {
      setTriggerAnimation(true)
    }
  }

  return (
    <m.div
      className={`${sizeClasses[size]} ${config.color} ${className} cursor-pointer select-none`}
      variants={getAnimationVariants()}
      initial="initial"
      animate="animate"
      whileHover={interactive && !reducedMotion ? { scale: 1.1 } : {}}
      whileTap={interactive && !reducedMotion ? { scale: 0.9 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleInteraction}
      aria-label={`${config.label}表情`}
      title={config.label}
      role="img"
    >
      {config.emoji}
    </m.div>
  )
}

interface AutoEmotionEmojiProps {
  /** 文字內容 */
  content: string
  /** 情緒檢測敏感度 (0-1) */
  sensitivity?: number
  /** 類名 */
  className?: string
}

/**
 * 自動情緒檢測emoji
 * 根據文字內容自動判斷並顯示對應情緒emoji
 */
export function AutoEmotionEmoji({ 
  content, 
  sensitivity = 0.7,
  className = '' 
}: AutoEmotionEmojiProps) {
  // 情緒關鍵詞檢測
  const emotionKeywords = {
    happy: ['開心', '高興', '愉快', '棒', '好', '讚', '完美', '太好了', 'awesome', 'great', 'good', 'perfect'],
    excited: ['興奮', '激動', '太棒了', 'amazing', 'wow', 'excellent', 'fantastic'],
    surprised: ['驚訝', '意外', '哇', 'oh', 'really', 'surprise', 'unexpected'],
    thoughtful: ['思考', '考慮', '讓我想想', 'hmm', 'think', 'consider', 'wonder'],
    confident: ['肯定', '確定', '絕對', 'definitely', 'certainly', 'absolutely', 'sure'],
    curious: ['好奇', '想知道', '疑問', 'question', 'curious', 'wonder', 'how', 'why'],
    cheerful: ['歡樂', '輕鬆', 'fun', 'cheerful', 'light', '轻松'],
    professional: ['專業', '建議', '推薦', 'professional', 'recommend', 'suggest', 'advice']
  }

  // 檢測情緒
  const detectEmotion = (): keyof typeof emotionKeywords => {
    const text = content.toLowerCase()
    
    // 計算每個情緒的匹配分數
    const scores = Object.entries(emotionKeywords).map(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase())).length
      return { emotion: emotion as keyof typeof emotionKeywords, score: matches }
    })
    
    // 找到最高分的情緒
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    )
    
    // 如果分數足夠高，返回對應情緒，否則返回預設
    return bestMatch.score >= sensitivity * 2 ? bestMatch.emotion : 'professional'
  }

  const detectedEmotion = detectEmotion()

  return (
    <div className={className}>
      <EmotionEmoji 
        emotion={detectedEmotion} 
        animation="bounce"
        size="md"
      />
    </div>
  )
}

// 預設導出
export default EmotionEmoji