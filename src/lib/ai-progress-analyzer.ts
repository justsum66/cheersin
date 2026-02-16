/**
 * P3-03：AI 輔助學習進度分析系統
 * 利用 AI 分析學習行為模式、預測學習瓶頸、提供個人化改善建議
 */

import { loadChatHistory, type ChatHistoryItem } from './chat-history'
import { logger } from './logger'

// 從 learn page 匯出的型別和函數
interface ProgressEntry { completed: number; total: number; completedAt?: string }
function loadProgress(): Record<string, ProgressEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('cheersin_learn_progress')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, ProgressEntry> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'completed' in v && 'total' in v) {
        const ent = v as ProgressEntry
        let completed = Math.floor(Number(ent.completed)) || 0
        let total = Math.floor(Number(ent.total)) || 0
        if (total < 1 || completed < 0) continue
        completed = Math.min(completed, total)
        out[k] = { completed, total }
        if (typeof ent.completedAt === 'string' && ent.completedAt.length >= 10) out[k].completedAt = ent.completedAt
      }
    }
    return out
  } catch {
    return {}
  }
}

// 學習行為分析結果
export interface LearningBehaviorAnalysis {
  // 學習模式識別
  learningPattern: 'consistent' | 'burst' | 'sporadic' | 'declining'
  peakLearningHours: number[]
  sessionDurationTrend: 'increasing' | 'decreasing' | 'stable'
  
  // 知識掌握度評估
  overallMastery: number // 0-100
  subjectStrengths: Record<string, number> // 各主題掌握度
  knowledgeGaps: string[] // 識別的知識缺口
  
  // 學習效率指標
  completionEfficiency: number // 完成率 vs 時間投入比
  retentionRate: number // 預估知識保留率
  learningVelocity: number // 學習速度指數
}

// 學習瓶頸識別
export interface LearningBottleneck {
  courseId: string
  title: string
  bottleneckType: 'conceptual' | 'practical' | 'motivational' | 'time'
  severity: 'low' | 'medium' | 'high'
  indicators: string[]
  aiRecommendations: string[]
}

// 個人化改善建議
export interface PersonalizedImprovement {
  priority: 'immediate' | 'short_term' | 'long_term'
  category: 'study_habits' | 'content_strategy' | 'time_management' | 'motivation'
  title: string
  description: string
  actionableSteps: string[]
  expectedImpact: 'high' | 'medium' | 'low'
}

// 學習預測模型
export interface LearningPrediction {
  estimatedCompletionDate: string
  likelihoodOfSuccess: number // 0-100
  riskFactors: string[]
  successIndicators: string[]
  milestonePredictions: { date: string; milestone: string; confidence: number }[]
}

/**
 * 1. 學習行為模式分析
 */

// 分析學習行為模式
export function analyzeLearningBehavior(): LearningBehaviorAnalysis {
  const progress = loadProgress()
  const chatHistory = loadChatHistory()
  
  if (Object.keys(progress).length === 0) {
    return createDefaultAnalysis()
  }
  
  // 1. 學習模式識別
  const learningPattern = identifyLearningPattern(progress)
  
  // 2. 高峰學習時間分析
  const peakHours = analyzePeakLearningHours(chatHistory)
  
  // 3. 學習時長趨勢
  const sessionTrend = analyzeSessionDurationTrend(progress)
  
  // 4. 整體掌握度評估
  const mastery = calculateOverallMastery(progress)
  
  // 5. 主題強項分析
  const strengths = analyzeSubjectStrengths(progress)
  
  // 6. 知識缺口識別
  const gaps = identifyKnowledgeGaps(progress, strengths)
  
  // 7. 學習效率計算
  const efficiency = calculateLearningEfficiency(progress)
  const retention = estimateRetentionRate(progress)
  const velocity = calculateLearningVelocity(progress)
  
  return {
    learningPattern,
    peakLearningHours: peakHours,
    sessionDurationTrend: sessionTrend,
    overallMastery: mastery,
    subjectStrengths: strengths,
    knowledgeGaps: gaps,
    completionEfficiency: efficiency,
    retentionRate: retention,
    learningVelocity: velocity
  }
}

// 識別學習模式
function identifyLearningPattern(progress: Record<string, ProgressEntry>): 
  'consistent' | 'burst' | 'sporadic' | 'declining' {
  const entries = Object.values(progress)
  if (entries.length === 0) return 'sporadic'
  
  // 計算每日學習頻率
  const completionDates: Record<string, number> = {}
  entries.forEach(entry => {
    if (entry.completedAt) {
      const date = entry.completedAt.split('T')[0]
      completionDates[date] = (completionDates[date] || 0) + 1
    }
  })
  
  const dates = Object.keys(completionDates).sort()
  if (dates.length < 3) return 'sporadic'
  
  // 計算學習間隔的變異係數
  const intervals: number[] = []
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.abs(
      new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()
    )
    intervals.push(diff / (1000 * 60 * 60 * 24)) // 轉換為天數
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const variance = intervals.reduce((sum, interval) => 
    sum + Math.pow(interval - avgInterval, 2), 0
  ) / intervals.length
  const cv = Math.sqrt(variance) / avgInterval // 變異係數
  
  if (cv < 0.5) return 'consistent'
  if (cv < 1.0) return 'burst'
  if (intervals.some(interval => interval > 7)) return 'declining'
  return 'sporadic'
}

// 分析高峰學習時間
function analyzePeakLearningHours(chatHistory: ChatHistoryItem[]): number[] {
  const hourCounts: Record<number, number> = {}
  
  chatHistory.forEach(item => {
    const hour = new Date(item.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  // 找出前 3 個高峰時段
  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour))
  
  return sortedHours.length > 0 ? sortedHours : [9, 14, 20] // 預設高峰時間
}

// 分析學習時長趨勢
function analyzeSessionDurationTrend(progress: Record<string, ProgressEntry>): 
  'increasing' | 'decreasing' | 'stable' {
  const completionTimes: number[] = []
  
  Object.values(progress).forEach(entry => {
    if (entry.completedAt) {
      const completionTime = new Date(entry.completedAt).getTime()
      const startTime = completionTime - (entry.completed * 10 * 60 * 1000) // 假設每課 10 分鐘
      completionTimes.push(completionTime - startTime)
    }
  })
  
  if (completionTimes.length < 3) return 'stable'
  
  // 計算移動平均趨勢
  const recentAvg = completionTimes.slice(-5).reduce((a, b) => a + b, 0) / 5
  const olderAvg = completionTimes.slice(0, 5).reduce((a, b) => a + b, 0) / 5
  
  const trend = (recentAvg - olderAvg) / olderAvg
  
  if (trend > 0.1) return 'increasing'
  if (trend < -0.1) return 'decreasing'
  return 'stable'
}

/**
 * 2. 知識掌握度評估
 */

// 計算整體掌握度
function calculateOverallMastery(progress: Record<string, ProgressEntry>): number {
  const entries = Object.values(progress)
  if (entries.length === 0) return 0
  
  const totalProgress = entries.reduce((sum, p) => sum + (p.completed / p.total), 0)
  const avgCompletion = totalProgress / entries.length
  
  // 考慮完成時間因素
  const recentCompletions = entries.filter(p => 
    p.completedAt && 
    new Date(p.completedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  const recencyBonus = recentCompletions.length > 0 ? 0.1 : 0
  
  return Math.min(100, Math.round((avgCompletion + recencyBonus) * 100))
}

// 分析主題強項
function analyzeSubjectStrengths(progress: Record<string, ProgressEntry>): Record<string, number> {
  const strengths: Record<string, number> = {}
  
  Object.entries(progress).forEach(([courseId, entry]) => {
    const category = getCourseCategory(courseId)
    if (category) {
      const current = strengths[category] || 0
      const score = (entry.completed / entry.total) * 100
      strengths[category] = Math.max(current, score)
    }
  })
  
  return strengths
}

// 識別知識缺口
function identifyKnowledgeGaps(
  progress: Record<string, ProgressEntry>,
  strengths: Record<string, number>
): string[] {
  const gaps: string[] = []
  
  // 基於未完成的必修課程
  const incompleteRequired = Object.entries(progress)
    .filter(([, entry]) => entry.completed < entry.total)
    .map(([courseId]) => courseId)
  
  incompleteRequired.forEach(courseId => {
    const category = getCourseCategory(courseId)
    if (category && (strengths[category] || 0) < 70) {
      gaps.push(`${category}基礎知識`)
    }
  })
  
  // 基於學習瓶頸
  const bottlenecks = identifyLearningBottlenecks(progress)
  bottlenecks.forEach(bottleneck => {
    if (bottleneck.severity === 'high') {
      gaps.push(bottleneck.title)
    }
  })
  
  return Array.from(new Set(gaps))
}

/**
 * 3. 學習效率分析
 */

// 計算學習效率
function calculateLearningEfficiency(progress: Record<string, ProgressEntry>): number {
  const entries = Object.values(progress)
  if (entries.length === 0) return 0
  
  // 效率 = 完成率 / 時間投入（相對值）
  const totalCompletion = entries.reduce((sum, p) => sum + p.completed, 0)
  const totalPossible = entries.reduce((sum, p) => sum + p.total, 0)
  
  const completionRate = totalCompletion / totalPossible
  
  // 估計時間投入（基於完成數量）
  const estimatedTime = entries.length * 30 // 每課平均 30 分鐘
  
  // 效率指數（越高越好）
  const efficiency = (completionRate * 100) / (estimatedTime / 60) // 每小時完成百分比
  
  return Math.min(100, Math.round(efficiency * 10))
}

// 估計知識保留率
function estimateRetentionRate(progress: Record<string, ProgressEntry>): number {
  const entries = Object.values(progress)
  if (entries.length === 0) return 0
  
  // 基於 Ebbinghaus 遺忘曲線模型
  let totalRetention = 0
  let count = 0
  
  entries.forEach(entry => {
    if (entry.completedAt) {
      const daysSinceCompletion = (Date.now() - new Date(entry.completedAt).getTime()) / 
        (1000 * 60 * 60 * 24)
      
      // 簡化的遺忘曲線公式
      const retention = Math.exp(-0.1 * Math.sqrt(daysSinceCompletion)) * 100
      totalRetention += Math.max(0, retention)
      count++
    }
  })
  
  return count > 0 ? Math.round(totalRetention / count) : 70 // 預設 70%
}

// 計算學習速度
function calculateLearningVelocity(progress: Record<string, ProgressEntry>): number {
  const entries = Object.values(progress)
  if (entries.length === 0) return 0
  
  // 計算最近學習速度
  const recentEntries = entries.filter(entry => 
    entry.completedAt && 
    new Date(entry.completedAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  )
  
  if (recentEntries.length === 0) return 50 // 中等速度
  
  const recentCompletion = recentEntries.reduce((sum, p) => sum + p.completed, 0)
  const velocity = (recentCompletion / recentEntries.length) * 10 // 標準化到 0-100
  
  return Math.min(100, Math.round(velocity))
}

/**
 * 4. 學習瓶頸識別
 */

// 識別學習瓶頸
export function identifyLearningBottlenecks(progress: Record<string, ProgressEntry>): LearningBottleneck[] {
  const bottlenecks: LearningBottleneck[] = []
  
  Object.entries(progress).forEach(([courseId, entry]) => {
    if (entry.completed < entry.total && entry.completed > 0) {
      const bottleneck = analyzeCourseBottleneck(courseId, entry)
      if (bottleneck) bottlenecks.push(bottleneck)
    }
  })
  
  return bottlenecks.sort((a, b) => 
    getBottleneckSeverityScore(b) - getBottleneckSeverityScore(a)
  )
}

// 分析單一課程瓶頸
function analyzeCourseBottleneck(courseId: string, entry: ProgressEntry): LearningBottleneck | null {
  const completionRate = entry.completed / entry.total
  const title = getCourseTitle(courseId)
  
  const indicators: string[] = []
  const recommendations: string[] = []
  
  let bottleneckType: LearningBottleneck['bottleneckType'] = 'conceptual'
  let severity: LearningBottleneck['severity'] = 'low'
  
  // 識別瓶頸類型
  if (completionRate < 0.3) {
    bottleneckType = 'motivational'
    severity = 'high'
    indicators.push('課程進度嚴重落後')
    recommendations.push('重新設定學習目標', '尋求學習夥伴支持')
  } else if (completionRate < 0.7) {
    bottleneckType = 'time'
    severity = completionRate < 0.5 ? 'medium' : 'low'
    indicators.push('時間投入不足')
    recommendations.push('制定固定學習時間', '分解學習任務')
  }
  
  // 基於課程類型的特定建議
  if (courseId.includes('advanced') || courseId.includes('l3') || courseId.includes('mw')) {
    bottleneckType = 'conceptual'
    if (completionRate < 0.6) {
      severity = 'high'
      recommendations.push('複習基礎概念', '尋求額外資源')
    }
  }
  
  return {
    courseId,
    title,
    bottleneckType,
    severity,
    indicators,
    aiRecommendations: recommendations
  }
}

// 瓶頸嚴重程度評分
function getBottleneckSeverityScore(bottleneck: LearningBottleneck): number {
  const severityScores: Record<string, number> = {
    'high': 3,
    'medium': 2,
    'low': 1
  }
  
  return severityScores[bottleneck.severity] || 1
}

/**
 * 5. 個人化改善建議
 */

// 產生個人化改善建議
export function generatePersonalizedImprovements(
  analysis: LearningBehaviorAnalysis,
  bottlenecks: LearningBottleneck[]
): PersonalizedImprovement[] {
  const improvements: PersonalizedImprovement[] = []
  
  // 1. 基於學習模式的建議
  if (analysis.learningPattern === 'sporadic' || analysis.learningPattern === 'declining') {
    improvements.push({
      priority: 'immediate',
      category: 'study_habits',
      title: '建立固定學習習慣',
      description: '建立每日或每週固定學習時間，提升學習一致性',
      actionableSteps: [
        '設定每日 15-30 分鐘學習時間',
        '使用提醒功能避免忘記',
        '選擇最適合的學習時段'
      ],
      expectedImpact: 'high'
    })
  }
  
  // 2. 基於效率的建議
  if (analysis.completionEfficiency < 50) {
    improvements.push({
      priority: 'short_term',
      category: 'time_management',
      title: '優化學習時間管理',
      description: '改善學習效率，用更少時間達成更好效果',
      actionableSteps: [
        '使用番茄工作法',
        '預習課程大綱',
        '重點學習核心概念'
      ],
      expectedImpact: 'medium'
    })
  }
  
  // 3. 基於瓶頸的建議
  bottlenecks.forEach(bottleneck => {
    if (bottleneck.severity === 'high') {
      improvements.push({
        priority: 'immediate',
        category: 'content_strategy',
        title: `克服${bottleneck.title}學習障礙`,
        description: `針對${bottleneck.title}提供專門的學習策略`,
        actionableSteps: bottleneck.aiRecommendations,
        expectedImpact: 'high'
      })
    }
  })
  
  // 4. 基於掌握度的建議
  if (analysis.overallMastery < 60) {
    improvements.push({
      priority: 'short_term',
      category: 'content_strategy',
      title: '強化基礎知識',
      description: '加強基礎概念理解，為進階學習打好根基',
      actionableSteps: [
        '重新學習核心課程',
        '增加練習題目',
        '尋求同伴討論'
      ],
      expectedImpact: 'high'
    })
  }
  
  // 5. 基於保留率的建議
  if (analysis.retentionRate < 60) {
    improvements.push({
      priority: 'long_term',
      category: 'study_habits',
      title: '改善知識保留策略',
      description: '採用間隔重複等科學方法提升長期記憶',
      actionableSteps: [
        '定期複習已完成課程',
        '製作學習筆記',
        '教授他人來加深理解'
      ],
      expectedImpact: 'medium'
    })
  }
  
  return improvements
}

/**
 * 6. 學習預測模型
 */

// 產生學習預測
export function generateLearningPredictions(
  progress: Record<string, ProgressEntry>,
  analysis: LearningBehaviorAnalysis
): LearningPrediction {
  const totalCourses = Object.keys(progress).length
  const completedCourses = Object.values(progress).filter(
    p => p.completed >= p.total
  ).length
  
  const completionRate = totalCourses > 0 ? completedCourses / totalCourses : 0
  
  // 預估完成日期
  let estimatedDays: number
  if (analysis.learningVelocity > 70) {
    estimatedDays = Math.ceil((totalCourses - completedCourses) * 5)
  } else if (analysis.learningVelocity > 40) {
    estimatedDays = Math.ceil((totalCourses - completedCourses) * 10)
  } else {
    estimatedDays = Math.ceil((totalCourses - completedCourses) * 15)
  }
  
  const estimatedCompletionDate = new Date(
    Date.now() + estimatedDays * 24 * 60 * 60 * 1000
  ).toISOString()
  
  // 成功機率
  const likelihoodOfSuccess = Math.min(100, Math.round(
    (analysis.completionEfficiency * 0.4) +
    (analysis.retentionRate * 0.3) +
    (analysis.learningVelocity * 0.3)
  ))
  
  // 風險因素
  const riskFactors: string[] = []
  if (analysis.learningPattern === 'declining') riskFactors.push('學習動機下降')
  if (analysis.completionEfficiency < 40) riskFactors.push('學習效率偏低')
  if (analysis.retentionRate < 50) riskFactors.push('知識保留不佳')
  
  // 成功指標
  const successIndicators: string[] = []
  if (analysis.learningPattern === 'consistent') successIndicators.push('學習習慣穩定')
  if (analysis.completionEfficiency > 70) successIndicators.push('學習效率高')
  if (analysis.retentionRate > 70) successIndicators.push('知識掌握良好')
  
  // 里程碑預測
  const milestones = generateMilestonePredictions(
    completedCourses,
    totalCourses,
    estimatedDays
  )
  
  return {
    estimatedCompletionDate,
    likelihoodOfSuccess,
    riskFactors,
    successIndicators,
    milestonePredictions: milestones
  }
}

// 產生里程碑預測
function generateMilestonePredictions(
  completed: number,
  total: number,
  estimatedDays: number
): LearningPrediction['milestonePredictions'] {
  const milestones = []
  const remaining = total - completed
  
  if (remaining > 0) {
    // 25% 里程碑
    if (completed + Math.ceil(remaining * 0.25) <= total) {
      milestones.push({
        date: new Date(Date.now() + (estimatedDays * 0.25) * 24 * 60 * 60 * 1000).toISOString(),
        milestone: '完成 25% 課程',
        confidence: 85
      })
    }
    
    // 50% 里程碑
    if (completed + Math.ceil(remaining * 0.5) <= total) {
      milestones.push({
        date: new Date(Date.now() + (estimatedDays * 0.5) * 24 * 60 * 60 * 1000).toISOString(),
        milestone: '完成 50% 課程',
        confidence: 80
      })
    }
    
    // 75% 里程碑
    if (completed + Math.ceil(remaining * 0.75) <= total) {
      milestones.push({
        date: new Date(Date.now() + (estimatedDays * 0.75) * 24 * 60 * 60 * 1000).toISOString(),
        milestone: '完成 75% 課程',
        confidence: 75
      })
    }
  }
  
  return milestones
}

/**
 * 7. 輔助函數
 */

// 取得課程分類
function getCourseCategory(courseId: string): string | null {
  const categoryMap: Record<string, string> = {
    'wine-basics': '葡萄酒',
    'whisky-101': '烈酒',
    'wset-l1-spirits': '烈酒',
    'wset-l2-wines': '葡萄酒',
    'wset-l3-viticulture': '葡萄酒',
    'wset-l3-tasting': '品飲',
    'cms-intro-somm': '侍酒師',
    'somm-exam-prep': '認證準備'
  }
  
  return categoryMap[courseId] || null
}

// 取得課程標題
function getCourseTitle(courseId: string): string {
  // 簡化的標題對應（實際應用中應從課程資料取得）
  const titleMap: Record<string, string> = {
    'wine-basics': '葡萄酒入門',
    'whisky-101': '威士忌基礎',
    'wset-l1-spirits': 'WSET L1 烈酒入門',
    'wset-l2-wines': 'WSET L2 葡萄酒產區',
    'wset-l3-viticulture': '葡萄栽培與風土',
    'wset-l3-tasting': '系統化品飲分析'
  }
  
  return titleMap[courseId] || courseId
}

// 建立預設分析
function createDefaultAnalysis(): LearningBehaviorAnalysis {
  return {
    learningPattern: 'sporadic',
    peakLearningHours: [9, 14, 20],
    sessionDurationTrend: 'stable',
    overallMastery: 0,
    subjectStrengths: {},
    knowledgeGaps: [],
    completionEfficiency: 50,
    retentionRate: 70,
    learningVelocity: 50
  }
}

/**
 * 8. 主要使用介面
 */

export function useAIProgressAnalysis(): {
  analysis: LearningBehaviorAnalysis;
  bottlenecks: LearningBottleneck[];
  improvements: PersonalizedImprovement[];
  prediction: LearningPrediction;
  refresh: () => void;
} {
  const progress = loadProgress()
  const analysis = analyzeLearningBehavior()
  const bottlenecks = identifyLearningBottlenecks(progress)
  const improvements = generatePersonalizedImprovements(analysis, bottlenecks)
  const prediction = generateLearningPredictions(progress, analysis)
  
  const refresh = () => {
    // 重新分析邏輯可在此實作
    logger.info('Learning analysis refreshed')
  }
  
  return {
    analysis,
    bottlenecks,
    improvements,
    prediction,
    refresh
  }
}