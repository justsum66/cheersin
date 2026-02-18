'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AnimationThemeManager, 
  useAnimationTheme, 
  DEFAULT_THEMES,
  generateThemeCSS
} from '@/lib/animation-theme-system'
import { EnhancedCardHover } from './EnhancedCardHover'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

/**
 * 動畫主題系統示範元件
 * 展示如何使用統一的動畫主題系統
 */
export function AnimationThemeDemo() {
  const { theme, changeTheme, availableThemes } = useAnimationTheme()
  const [selectedElement, setSelectedElement] = useState<string>('card')
  const [animationType, setAnimationType] = useState('scale')

  // 生成CSS變數
  const themeCSS = generateThemeCSS(theme)

  // 動畫配置
  const animationVariants = {
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 }
    },
    slide: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    bounce: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -50, opacity: 0 }
    }
  }

  const currentVariant = animationVariants[animationType as keyof typeof animationVariants] || animationVariants.scale

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <style>{themeCSS}</style>
      
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">動畫主題系統</h1>
          <p className="text-white/70 text-lg">統一的動畫配置和主題管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主題選擇面板 */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">主題選擇</h2>
            
            <div className="space-y-4">
              {availableThemes.map((themeName) => (
                <Button
                  key={themeName}
                  variant={theme.name === themeName ? 'primary' : 'outline'}
                  className="w-full justify-start capitalize"
                  onClick={() => changeTheme(themeName)}
                >
                  {themeName} 主題
                </Button>
              ))}
            </div>

            {/* 主題預覽 */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-medium mb-3">目前主題: {theme.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-white/60">主要顏色:</span>
                  <div 
                    className="w-6 h-6 rounded mt-1 border border-white/20"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                </div>
                <div>
                  <span className="text-white/60">次要顏色:</span>
                  <div 
                    className="w-6 h-6 rounded mt-1 border border-white/20"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 動畫預覽區域 */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-6">動畫預覽</h2>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.keys(animationVariants).map((type) => (
                  <Button
                    key={type}
                    variant={animationType === type ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setAnimationType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {['card', 'button', 'text'].map((element) => (
                  <Button
                    key={element}
                    variant={selectedElement === element ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedElement(element)}
                  >
                    {element}
                  </Button>
                ))}
              </div>

              <div className="min-h-[300px] flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
                {selectedElement === 'card' && (
                  <motion.div
                    key={`${theme.name}-${animationType}`}
                    variants={currentVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      duration: theme.durations.normal,
                      ease: theme.easings.standard as any
                    }}
                  >
                    <EnhancedCardHover variant="premium" className="w-64">
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">動畫卡片</h3>
                        <p className="text-white/70">主題: {theme.name}</p>
                        <div className="mt-4 flex justify-center">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                      </div>
                    </EnhancedCardHover>
                  </motion.div>
                )}

                {selectedElement === 'button' && (
                  <motion.div
                    key={`${theme.name}-${animationType}`}
                    variants={currentVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      duration: theme.durations.normal,
                      ease: theme.easings.standard as any
                    }}
                  >
                    <Button
                      size="lg"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        boxShadow: theme.shadows.medium
                      }}
                    >
                      動畫按鈕
                    </Button>
                  </motion.div>
                )}

                {selectedElement === 'text' && (
                  <motion.div
                    key={`${theme.name}-${animationType}`}
                    variants={currentVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      duration: theme.durations.normal,
                      ease: theme.easings.standard as any
                    }}
                    className="text-center"
                  >
                    <h2 
                      className="text-4xl font-bold mb-4"
                      style={{ color: theme.colors.primary }}
                    >
                      動畫文字
                    </h2>
                    <p 
                      className="text-xl"
                      style={{ color: theme.colors.secondary }}
                    >
                      主題: {theme.name}
                    </p>
                  </motion.div>
                )}
              </div>
            </GlassCard>

            {/* 主題配置詳情 */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">主題配置</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-medium mb-3">持續時間</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">快速:</span>
                      <span className="text-white">{theme.durations.fast}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">正常:</span>
                      <span className="text-white">{theme.durations.normal}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">慢速:</span>
                      <span className="text-white">{theme.durations.slow}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">最慢:</span>
                      <span className="text-white">{theme.durations.slowest}s</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3">緩動函數</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/70">Standard:</span>
                      <code className="block text-white/80 bg-black/30 p-2 rounded mt-1 text-xs">
                        {theme.easings.standard}
                      </code>
                    </div>
                    <div>
                      <span className="text-white/70">Gentle:</span>
                      <code className="block text-white/80 bg-black/30 p-2 rounded mt-1 text-xs">
                        {theme.easings.gentle}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-white font-medium mb-3">顏色配置</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(theme.colors).map(([name, color]) => (
                      <div key={name} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <div className="text-white capitalize">{name}</div>
                          <div className="text-white/60 text-xs">{color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

// 主題切換工具元件
export function ThemeSwitcher() {
  const { theme, changeTheme, availableThemes } = useAnimationTheme()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <GlassCard className="p-4">
        <div className="text-center mb-3">
          <div className="text-white text-sm font-medium">目前主題</div>
          <div className="text-white/70 text-xs capitalize">{theme.name}</div>
        </div>
        
        <div className="space-y-2">
          {availableThemes.map((themeName) => (
            <button
              key={themeName}
              onClick={() => changeTheme(themeName)}
              className={`
                w-full px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${theme.name === themeName 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
            >
              {themeName}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}