'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CustomizationManager, 
  useComponentCustomization,
  DEFAULT_CUSTOMIZATION_OPTIONS
} from '@/lib/component-customization'
import { 
  EnhancedCardHover 
} from './EnhancedCardHover'
import { 
  TypingAnimation 
} from './TypingAnimation'
import { 
  EmotionEmoji 
} from './EmotionEmoji'
import { 
  ShimmerProgressBar 
} from './ShimmerProgressBar'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

/**
 * 元件自定義選項示範
 * 展示如何為元件添加可配置選項
 */
export function ComponentCustomizationDemo() {
  const [activeComponent, setActiveComponent] = useState('enhancedCardHover')
  const [exportedSettings, setExportedSettings] = useState('')

  const components = [
    { id: 'enhancedCardHover', name: '卡片懸浮效果', component: CardHoverDemo },
    { id: 'typingAnimation', name: '打字機動畫', component: TypingDemo },
    { id: 'emotionEmoji', name: '情緒表情', component: EmojiDemo },
    { id: 'shimmerProgressBar', name: '流光進度條', component: ProgressDemo }
  ]

  const activeDemo = components.find(c => c.id === activeComponent) || components[0]

  const exportSettings = () => {
    const manager = CustomizationManager.getInstance()
    setExportedSettings(manager.exportSettings())
  }

  const importSettings = () => {
    if (exportedSettings) {
      const manager = CustomizationManager.getInstance()
      const success = manager.importSettings(exportedSettings)
      if (success) {
        alert('設定匯入成功！')
      } else {
        alert('設定匯入失敗！')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">元件自定義系統</h1>
          <p className="text-white/70 text-lg">為UI元件添加可配置選項</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 側邊選單 */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">元件選擇</h2>
              
              <div className="space-y-3">
                {components.map((component) => (
                  <Button
                    key={component.id}
                    variant={activeComponent === component.id ? 'primary' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setActiveComponent(component.id)}
                  >
                    {component.name}
                  </Button>
                ))}
              </div>

              {/* 設定管理 */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-white font-medium mb-4">設定管理</h3>
                <div className="space-y-3">
                  <Button
                    onClick={exportSettings}
                    className="w-full"
                    size="sm"
                  >
                    匯出設定
                  </Button>
                  <Button
                    onClick={importSettings}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    匯入設定
                  </Button>
                </div>
                
                {exportedSettings && (
                  <div className="mt-4">
                    <textarea
                      value={exportedSettings}
                      onChange={(e) => setExportedSettings(e.target.value)}
                      className="w-full h-32 bg-black/30 text-white text-xs p-3 rounded border border-white/20 font-mono"
                      placeholder="設定JSON..."
                    />
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* 主要內容區域 */}
          <div className="lg:col-span-3">
            <GlassCard className="p-8">
              <activeDemo.component />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

// 卡片懸浮效果示範
function CardHoverDemo() {
  const { settings, updateSettings, getCustomization } = useComponentCustomization('enhancedCardHover')
  const customization = getCustomization()

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">卡片懸浮效果自定義</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 設定面板 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">自定義選項</h3>
          <div className="space-y-4">
            {customization?.options.map((option) => (
              <div key={option.id} className="bg-white/5 p-4 rounded-lg">
                <label className="block text-white font-medium mb-2">
                  {option.label}
                </label>
                <p className="text-white/60 text-sm mb-3">{option.description}</p>
                
                {option.type === 'select' && (
                  <select
                    value={settings[option.id] ?? option.defaultValue}
                    onChange={(e) => updateSettings({ [option.id]: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    {option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {option.type === 'range' && (
                  <div>
                    <input
                      type="range"
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      value={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-white/60 text-sm mt-1">
                      值: {settings[option.id] ?? option.defaultValue}
                    </div>
                  </div>
                )}
                
                {option.type === 'boolean' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-white">啟用</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 預覽區域 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">即時預覽</h3>
          <div className="flex items-center justify-center min-h-[300px] bg-black/20 rounded-xl border border-white/10">
            <EnhancedCardHover
              variant={settings.variant ?? 'standard'}
              tiltIntensity={settings.tiltIntensity ?? 3}
              scaleIntensity={settings.scaleIntensity ?? 1.05}
              enableLighting={settings.enableLighting ?? true}
              enableGlow={settings.enableGlow ?? true}
              className="w-64"
            >
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">自定義卡片</h3>
                <p className="text-white/70">
                  傾斜: {settings.tiltIntensity ?? 3}
                  <br />
                  縮放: {settings.scaleIntensity ?? 1.05}
                </p>
              </div>
            </EnhancedCardHover>
          </div>
        </div>
      </div>
    </div>
  )
}

// 打字機動畫示範
function TypingDemo() {
  const { settings, updateSettings, getCustomization } = useComponentCustomization('typingAnimation')
  const customization = getCustomization()

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">打字機動畫自定義</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 設定面板 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">自定義選項</h3>
          <div className="space-y-4">
            {customization?.options.map((option) => (
              <div key={option.id} className="bg-white/5 p-4 rounded-lg">
                <label className="block text-white font-medium mb-2">
                  {option.label}
                </label>
                <p className="text-white/60 text-sm mb-3">{option.description}</p>
                
                {option.type === 'range' && (
                  <div>
                    <input
                      type="range"
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      value={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-white/60 text-sm mt-1">
                      值: {settings[option.id] ?? option.defaultValue}ms
                    </div>
                  </div>
                )}
                
                {option.type === 'boolean' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-white">啟用</span>
                  </label>
                )}
                
                {option.type === 'string' && (
                  <input
                    type="text"
                    value={settings[option.id] ?? option.defaultValue}
                    onChange={(e) => updateSettings({ [option.id]: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                    maxLength={1}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 預覽區域 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">即時預覽</h3>
          <div className="p-6 bg-black/20 rounded-xl border border-white/10 min-h-[300px]">
            <div className="bg-white/5 p-4 rounded-lg mb-4">
              <TypingAnimation
                text="這是一個自定義的打字機動畫效果"
                speed={settings.speed ?? 50}
                showCursor={settings.showCursor ?? true}
                cursorChar={settings.cursorCharacter ?? '|'}
                loop={settings.loop ?? false}
              />
            </div>
            
            <div className="text-white/60 text-sm">
              <p>速度: {settings.speed ?? 50}ms/字元</p>
              <p>游標: {settings.showCursor ? '顯示' : '隱藏'}</p>
              <p>延遲: {settings.delay ?? 0}ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 情緒表情示範
function EmojiDemo() {
  const { settings, updateSettings, getCustomization } = useComponentCustomization('emotionEmoji')
  const customization = getCustomization()

  const emotions = ['happy', 'excited', 'surprised', 'thoughtful', 'confident', 'curious']

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">情緒表情自定義</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 設定面板 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">自定義選項</h3>
          <div className="space-y-4">
            {customization?.options.map((option) => (
              <div key={option.id} className="bg-white/5 p-4 rounded-lg">
                <label className="block text-white font-medium mb-2">
                  {option.label}
                </label>
                <p className="text-white/60 text-sm mb-3">{option.description}</p>
                
                {option.type === 'select' && (
                  <select
                    value={settings[option.id] ?? option.defaultValue}
                    onChange={(e) => updateSettings({ [option.id]: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    {option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {option.type === 'range' && (
                  <div>
                    <input
                      type="range"
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      value={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-white/60 text-sm mt-1">
                      倍率: {settings[option.id] ?? option.defaultValue}x
                    </div>
                  </div>
                )}
                
                {option.type === 'boolean' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-white">啟用互動</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 預覽區域 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">即時預覽</h3>
          <div className="grid grid-cols-2 gap-4 p-6 bg-black/20 rounded-xl border border-white/10 min-h-[300px]">
            {emotions.map((emotion) => (
              <div key={emotion} className="text-center p-4 bg-white/5 rounded-lg">
                <EmotionEmoji
                  emotion={emotion as any}
                  animation={settings.animation ?? 'bounce'}
                  size={settings.size ?? 'md'}
                  interactive={settings.interactive ?? true}
                  className="mb-2"
                />
                <div className="text-white/70 text-sm capitalize">{emotion}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-white/60 text-sm">
              動畫: {settings.animation ?? 'bounce'} | 
              大小: {settings.size ?? 'md'} | 
              速度: {settings.animationSpeed ?? 1}x
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 流光進度條示範
function ProgressDemo() {
  const { settings, updateSettings, getCustomization } = useComponentCustomization('shimmerProgressBar')
  const [progress, setProgress] = useState(35)
  const customization = getCustomization()

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">流光進度條自定義</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 設定面板 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">自定義選項</h3>
          <div className="space-y-4">
            {customization?.options.map((option) => (
              <div key={option.id} className="bg-white/5 p-4 rounded-lg">
                <label className="block text-white font-medium mb-2">
                  {option.label}
                </label>
                <p className="text-white/60 text-sm mb-3">{option.description}</p>
                
                {option.type === 'select' && (
                  <select
                    value={settings[option.id] ?? option.defaultValue}
                    onChange={(e) => updateSettings({ [option.id]: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    {option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {option.type === 'range' && (
                  <div>
                    <input
                      type="range"
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      value={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-white/60 text-sm mt-1">
                      值: {settings[option.id] ?? option.defaultValue}
                      {option.id === 'shimmerSpeed' && '秒'}
                    </div>
                  </div>
                )}
                
                {option.type === 'boolean' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings[option.id] ?? option.defaultValue}
                      onChange={(e) => updateSettings({ [option.id]: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-white">啟用流光</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 預覽區域 */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">即時預覽</h3>
          <div className="space-y-6 p-6 bg-black/20 rounded-xl border border-white/10 min-h-[300px]">
            <div>
              <label className="block text-white font-medium mb-2">進度控制</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-white/60 text-sm mt-1">進度: {progress}%</div>
            </div>
            
            <div className="space-y-4">
              <ShimmerProgressBar
                value={progress}
                variant={settings.variant ?? 'primary'}
                height={settings.height ?? 'md'}
                shimmer={settings.shimmer ?? true}
                shimmerSpeed={settings.shimmerSpeed ?? 2}
                rounded={settings.rounded ?? 'full'}
                showLabel={true}
              />
              
              <ShimmerProgressBar
                value={75}
                variant={settings.variant ?? 'primary'}
                height={settings.height ?? 'md'}
                shimmer={settings.shimmer ?? true}
                shimmerSpeed={settings.shimmerSpeed ?? 2}
                rounded={settings.rounded ?? 'full'}
                showLabel={true}
                label="示範進度"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}