/**
 * Design System Demo - 簡化版展示元件
 */

import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'

// 匯入設計 tokens
import {
  BRAND_COLORS,
  BACKGROUND_COLORS,
  STATE_COLORS,
  SEMANTIC_SPACING,
  ELEVATION_LEVELS,
  GLASS_INTENSITY,
} from '@/design-system/tokens'

export function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0a2e] p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Design System Showcase
          </h1>
          <p className="text-lg text-white/70">
            完整的設計系統 tokens 展示
          </p>
        </div>

        {/* 顏色系統展示 */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            顏色系統 (Color System)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 品牌色 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                品牌色 (Brand Colors)
              </h3>
              <div className="space-y-3">
                {Object.entries(BRAND_COLORS.primary).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg border border-white/20"
                      style={{ backgroundColor: value }}
                    />
                    <div>
                      <div className="text-white font-medium">
                        Primary {key}
                      </div>
                      <div className="text-white/50 text-sm">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 狀態色 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                狀態色 (State Colors)
              </h3>
              <div className="space-y-3">
                {Object.entries(STATE_COLORS).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg border border-white/20"
                      style={{ backgroundColor: value.DEFAULT }}
                    />
                    <div>
                      <div className="text-white font-medium">
                        {key}
                      </div>
                      <div className="text-white/50 text-sm">
                        {value.DEFAULT}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 間距系統展示 */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            間距系統 (Spacing System)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(SEMANTIC_SPACING).slice(0, 8).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="mx-auto mb-2 bg-[#ff2e63] rounded"
                  style={{ 
                    width: value, 
                    height: '24px'
                  }}
                />
                <div className="text-white font-medium text-sm">
                  {key}
                </div>
                <div className="text-white/50 text-xs">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 層級系統展示 */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            層級系統 (Elevation System)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(ELEVATION_LEVELS).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="w-full h-24 rounded-xl bg-white/5 border border-white/10 mb-3 flex items-center justify-center transition-all duration-300 hover:scale-105"
                  style={{ 
                    boxShadow: value.shadow,
                    zIndex: value.level * 10
                  }}
                >
                  <span className="text-white font-medium">
                    Level {value.level}
                  </span>
                </div>
                <div className="text-white font-medium">
                  {key}
                </div>
                <div className="text-white/50 text-sm mt-1">
                  {value.description}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 玻璃擬態展示 */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            玻璃擬態系統 (Glassmorphism)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(GLASS_INTENSITY).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="w-full h-32 rounded-2xl mb-3 flex items-center justify-center transition-all duration-300 hover:scale-105 border"
                  style={{
                    background: `rgba(255, 255, 255, ${value.backgroundOpacity})`,
                    borderColor: `rgba(255, 255, 255, ${value.borderOpacity})`,
                    backdropFilter: `blur(${value.backdropBlur})`,
                    WebkitBackdropFilter: `blur(${value.backdropBlur})`,
                  }}
                >
                  <span className="text-white font-medium">
                    {key}
                  </span>
                </div>
                <div className="text-white text-sm">
                  {Math.round(value.backgroundOpacity * 100)}% 透明度
                </div>
                <div className="text-white/50 text-xs">
                  {value.backdropBlur} 模糊
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default DesignSystemDemo