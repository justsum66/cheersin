'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ChevronDown, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react'

interface ExamPoint {
  topic: string
  importance: 'high' | 'medium' | 'low'
  examTypes: ('WSET L2' | 'WSET L3' | 'CMS' | 'MW')[]
  description: string
}

interface ExamPointsReferenceProps {
  courseId: string
  chapterTitle?: string
  className?: string
}

// 考點資料庫（依課程 ID）
const EXAM_POINTS_DB: Record<string, ExamPoint[]> = {
  'wine-basics': [
    { topic: '葡萄酒顏色判讀', importance: 'high', examTypes: ['WSET L2', 'WSET L3'], description: '觀察酒液顏色深淺、邊緣色調變化' },
    { topic: '香氣辨識', importance: 'high', examTypes: ['WSET L2', 'WSET L3', 'CMS'], description: '辨識主要、次要、陳年香氣特徵' },
    { topic: '口感結構分析', importance: 'high', examTypes: ['WSET L2', 'WSET L3', 'CMS', 'MW'], description: '評估酸度、單寧、酒體、餘韻' },
    { topic: '基本釀造流程', importance: 'medium', examTypes: ['WSET L2'], description: '壓榨、發酵、培養、裝瓶流程' },
    { topic: '葡萄品種特性', importance: 'high', examTypes: ['WSET L2', 'WSET L3'], description: '主要國際品種的典型風格' },
  ],
  'wine-advanced': [
    { topic: '風土概念', importance: 'high', examTypes: ['WSET L3', 'MW'], description: '土壤、氣候、地形對葡萄酒的影響' },
    { topic: '橡木桶影響', importance: 'medium', examTypes: ['WSET L2', 'WSET L3'], description: '不同橡木桶大小、新舊、烘烤程度的影響' },
    { topic: '產區法規', importance: 'high', examTypes: ['WSET L3', 'MW'], description: '主要產區的分級制度與法規' },
    { topic: '年份變化', importance: 'medium', examTypes: ['WSET L3', 'MW'], description: '氣候年份對葡萄酒品質的影響' },
    { topic: '陳年潛力', importance: 'medium', examTypes: ['WSET L3', 'CMS', 'MW'], description: '判斷葡萄酒陳年能力的因素' },
  ],
  'white-wine': [
    { topic: '白酒釀造特點', importance: 'high', examTypes: ['WSET L2', 'WSET L3'], description: '冷浸泡、發酵溫度控制、乳酸發酵' },
    { topic: '夏多內風格變化', importance: 'high', examTypes: ['WSET L2', 'WSET L3'], description: '不同產區與釀造方式的風格差異' },
    { topic: '麗絲玲甜度分級', importance: 'medium', examTypes: ['WSET L2', 'WSET L3'], description: '德國 Pradikat 分級系統' },
    { topic: '長相思典型特徵', importance: 'medium', examTypes: ['WSET L2'], description: '紐西蘭 vs 法國羅亞爾河風格比較' },
  ],
  'whisky-101': [
    { topic: '蒸餾原理', importance: 'high', examTypes: ['WSET L2'], description: '壺式蒸餾與柱式蒸餾的差異' },
    { topic: '威士忌類型', importance: 'high', examTypes: ['WSET L2'], description: '蘇格蘭、愛爾蘭、美國、日本威士忌特色' },
    { topic: '桶陳影響', importance: 'medium', examTypes: ['WSET L2'], description: '不同橡木桶對風味的貢獻' },
    { topic: '產區特色', importance: 'medium', examTypes: ['WSET L2'], description: '蘇格蘭五大產區風格差異' },
  ],
  '_default': [
    { topic: '品飲技巧', importance: 'high', examTypes: ['WSET L2', 'WSET L3', 'CMS'], description: '系統化品飲方法 (SAT)' },
    { topic: '酒款辨識', importance: 'high', examTypes: ['WSET L3', 'CMS', 'MW'], description: '盲飲時的推理邏輯' },
    { topic: '餐酒搭配原則', importance: 'medium', examTypes: ['WSET L2', 'CMS'], description: '基本搭配原則與經典組合' },
  ],
}

/**
 * Phase 2 A1.1: 考點對照表
 * 明確標示課程內容與認證考試的關聯
 */
export function ExamPointsReference({ courseId, chapterTitle, className = '' }: ExamPointsReferenceProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterExam, setFilterExam] = useState<string | null>(null)

  const examPoints = useMemo(() => {
    return EXAM_POINTS_DB[courseId] || EXAM_POINTS_DB['_default']
  }, [courseId])

  const filteredPoints = useMemo(() => {
    if (!filterExam) return examPoints
    return examPoints.filter(p => p.examTypes.includes(filterExam as any))
  }, [examPoints, filterExam])

  const examTypes = useMemo(() => {
    const types = new Set<string>()
    examPoints.forEach(p => p.examTypes.forEach(t => types.add(t)))
    return Array.from(types)
  }, [examPoints])

  const importanceColors = {
    high: 'text-red-400 bg-red-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    low: 'text-emerald-400 bg-emerald-500/10',
  }

  const importanceLabels = {
    high: '必考',
    medium: '常考',
    low: '偶考',
  }

  return (
    <div className={`rounded-xl bg-white/5 border border-white/10 overflow-hidden ${className}`}>
      {/* 標題列 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <GraduationCap className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-left">
            <h4 className="text-white font-medium">考點對照表</h4>
            <p className="text-white/50 text-xs">
              {examPoints.length} 個考點 · 涵蓋 {examTypes.join('、')}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>

      {/* 展開內容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4">
              {/* 考試類型篩選 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setFilterExam(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterExam === null
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  全部
                </button>
                {examTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterExam(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterExam === type
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* 考點列表 */}
              <div className="space-y-2">
                {filteredPoints.map((point, idx) => (
                  <motion.div
                    key={point.topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {point.importance === 'high' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                            point.importance === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`} />
                        )}
                        <span className="text-white font-medium text-sm">{point.topic}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${importanceColors[point.importance]}`}>
                        {importanceLabels[point.importance]}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mb-2 ml-6">{point.description}</p>
                    <div className="flex flex-wrap gap-1.5 ml-6">
                      {point.examTypes.map(exam => (
                        <span
                          key={exam}
                          className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-xs"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 底部說明 */}
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                <BookOpen className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <p className="text-white/50 text-xs">
                  本對照表根據各認證機構官方考綱整理，幫助你聚焦重點內容。實際考題可能涵蓋更廣範圍，建議完整學習課程內容。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExamPointsReference
