'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { loadWrongAnswers } from '@/lib/wrong-answers'

interface SkillRadarChartProps {
  courseId?: string
  className?: string
}

interface SkillData {
  label: string
  value: number
  maxValue: number
}

/**
 * Phase 2 C2.1: 強弱項雷達圖
 * 基於錯題本數據分析學習者的六維度能力分布
 */
export function SkillRadarChart({ courseId, className = '' }: SkillRadarChartProps) {
  const skillData = useMemo(() => {
    const wrongAnswers = loadWrongAnswers()
    const filtered = courseId 
      ? wrongAnswers.filter(a => a.courseId === courseId)
      : wrongAnswers

    // 六維度分析（基於課程類別分佈）
    const categories: Record<string, { wrong: number; total: number }> = {
      '葡萄酒基礎': { wrong: 0, total: 10 },
      '品飲技巧': { wrong: 0, total: 10 },
      '產區知識': { wrong: 0, total: 10 },
      '調酒技術': { wrong: 0, total: 10 },
      '威士忌/烈酒': { wrong: 0, total: 10 },
      '清酒/啤酒': { wrong: 0, total: 10 },
    }

    // 依課程 ID 分類錯題
    filtered.forEach(answer => {
      if (answer.courseId.includes('wine') || answer.courseId.includes('wset')) {
        categories['葡萄酒基礎'].wrong++
      } else if (answer.courseId.includes('tasting') || answer.courseId.includes('pairing')) {
        categories['品飲技巧'].wrong++
      } else if (answer.courseId.includes('region') || answer.courseId.includes('bordeaux') || answer.courseId.includes('burgundy')) {
        categories['產區知識'].wrong++
      } else if (answer.courseId.includes('cocktail') || answer.courseId.includes('bar')) {
        categories['調酒技術'].wrong++
      } else if (answer.courseId.includes('whisky') || answer.courseId.includes('brandy') || answer.courseId.includes('spirit')) {
        categories['威士忌/烈酒'].wrong++
      } else if (answer.courseId.includes('sake') || answer.courseId.includes('beer')) {
        categories['清酒/啤酒'].wrong++
      }
    })

    // 轉換為雷達圖數據（分數 = 總分 - 錯誤數）
    return Object.entries(categories).map(([label, data]) => ({
      label,
      value: Math.max(0, data.total - data.wrong),
      maxValue: data.total,
    }))
  }, [courseId])

  const numPoints = skillData.length
  const angleStep = (2 * Math.PI) / numPoints
  const centerX = 100
  const centerY = 100
  const maxRadius = 80

  // 計算多邊形頂點
  const getPoint = (index: number, value: number, max: number) => {
    const angle = index * angleStep - Math.PI / 2
    const radius = (value / max) * maxRadius
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  }

  // 生成數據多邊形路徑
  const dataPath = skillData
    .map((skill, i) => {
      const point = getPoint(i, skill.value, skill.maxValue)
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    })
    .join(' ') + ' Z'

  // 生成網格層級
  const gridLevels = [0.25, 0.5, 0.75, 1]
  const gridPaths = gridLevels.map(level => {
    return skillData
      .map((_, i) => {
        const point = getPoint(i, level * 10, 10)
        return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      })
      .join(' ') + ' Z'
  })

  // 計算標籤位置
  const labelPositions = skillData.map((skill, i) => {
    const angle = i * angleStep - Math.PI / 2
    const labelRadius = maxRadius + 15
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle),
      label: skill.label,
      value: skill.value,
      anchor: angle > -Math.PI / 2 && angle < Math.PI / 2 ? 'start' : 'end',
    }
  })

  // 計算總體平均分
  const avgScore = skillData.reduce((sum, s) => sum + s.value, 0) / numPoints

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">能力雷達圖</h3>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">綜合評分</span>
          <span className="text-primary-400 font-bold text-lg">{avgScore.toFixed(1)}</span>
          <span className="text-white/40 text-xs">/ 10</span>
        </div>
      </div>
      
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full max-w-[280px] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 網格背景 */}
        {gridPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* 軸線 */}
        {skillData.map((_, i) => {
          const endPoint = getPoint(i, 10, 10)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}
        
        {/* 數據區域 */}
        <motion.path
          d={dataPath}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="rgb(139, 92, 246)"
          strokeWidth="2"
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, fillOpacity: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* 數據點 */}
        {skillData.map((skill, i) => {
          const point = getPoint(i, skill.value, skill.maxValue)
          return (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(139, 92, 246)"
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3, type: 'spring' }}
            />
          )
        })}
        
        {/* 標籤 */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white/70 text-[8px] font-medium"
          >
            {pos.label}
          </text>
        ))}
      </motion.svg>
      
      {/* 圖例說明 */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {skillData.map((skill, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/5">
            <span className="text-white/60">{skill.label}</span>
            <span className={`font-medium ${skill.value >= 7 ? 'text-primary-400' : skill.value >= 4 ? 'text-amber-400' : 'text-red-400'}`}>
              {skill.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkillRadarChart
