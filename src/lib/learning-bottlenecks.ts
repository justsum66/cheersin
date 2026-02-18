/**
 * P3-05：學習瓶頸自動識別系統
 * 自動偵測學習過程中的阻礙因素，提供即時改善建議
 */

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

// 學習瓶頸類型定義
export type BottleneckType = 
  | 'conceptual'      // 概念理解困難
  | 'practical'       // 實作技能不足
  | 'motivational'    // 動機不足
  | 'time'           // 時間管理問題
  | 'resource'       // 資源不足
  | 'technical'      // 技術障礙

// 瓶頸嚴重程度
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

// 學習瓶頸結構
export interface LearningBottleneck {
  id: string
  courseId: string
  title: string
  type: BottleneckType
  severity: SeverityLevel
  detectionMethod: 'behavioral' | 'performance' | 'self_report' | 'ai_analysis'
  indicators: string[] // 偵測到的具體指標
  rootCause: string // 根本原因分析
  impactAreas: string[] // 影響的學習領域
  detectedAt: string
  resolvedAt?: string
  resolutionStatus: 'detected' | 'in_progress' | 'resolved' | 'dismissed'
}

// 瓶頸偵測規則
interface DetectionRule {
  name: string
  condition: (data: LearningMetrics) => boolean
  weight: number // 重要性權重 1-10
  bottleneckType: BottleneckType
  severityCalculator: (data: LearningMetrics) => SeverityLevel
  indicators: string[]
}

// 學習行為指標
interface LearningMetrics {
  // 進度相關
  completionRate: number
  progressVelocity: number
  timeToComplete: number
  
  // 互動相關
  sessionFrequency: number
  averageSessionDuration: number
  engagementScore: number
  
  // 表現相關
  quizScores: number[]
  retryAttempts: number
  helpRequests: number
  
  // 時間相關
  timeBetweenSessions: number
  studyTimeConsistency: number
  peakStudyHours: number[]
}

/**
 * 1. 瓶頸偵測引擎
 */

// 主要瓶頸偵測函數
export function detectLearningBottlenecks(
  courseId: string,
  userId?: string
): LearningBottleneck[] {
  const progress = loadProgress()
  const courseProgress = progress[courseId]
  
  if (!courseProgress) {
    return []
  }
  
  // 收集學習指標
  const metrics = collectLearningMetrics(courseId, courseProgress)
  
  // 應用偵測規則
  const bottlenecks = applyDetectionRules(courseId, metrics)
  
  // AI 分析補充
  const aiBottlenecks = performAIAnalysis(courseId, metrics, bottlenecks)
  
  // 合併並去重
  const allBottlenecks = [...bottlenecks, ...aiBottlenecks]
  return deduplicateBottlenecks(allBottlenecks)
}

// 收集學習指標
function collectLearningMetrics(
  courseId: string,
  progress: ProgressEntry
): LearningMetrics {
  // 進度指標
  const completionRate = progress.completed / progress.total
  const progressVelocity = calculateProgressVelocity(courseId)
  const timeToComplete = progress.completedAt ? 
    new Date(progress.completedAt).getTime() - getCourseStartDate(courseId) : 0
  
  // 互動指標（從 localStorage 或其他來源）
  const interactionData = getInteractionData(courseId)
  const sessionFrequency = interactionData.sessionCount
  const averageSessionDuration = interactionData.totalTime / Math.max(1, interactionData.sessionCount)
  const engagementScore = calculateEngagementScore(interactionData)
  
  // 表現指標
  const quizScores = getQuizScores(courseId)
  const retryAttempts = countRetryAttempts(courseId)
  const helpRequests = countHelpRequests(courseId)
  
  // 時間指標
  const timeBetweenSessions = calculateAverageTimeBetweenSessions(courseId)
  const studyTimeConsistency = calculateTimeConsistency(courseId)
  const peakStudyHours = analyzePeakStudyHours(courseId)
  
  return {
    completionRate,
    progressVelocity,
    timeToComplete,
    sessionFrequency,
    averageSessionDuration,
    engagementScore,
    quizScores,
    retryAttempts,
    helpRequests,
    timeBetweenSessions,
    studyTimeConsistency,
    peakStudyHours
  }
}

/**
 * 2. 偵測規則定義
 */

// 概念理解瓶頸規則
const conceptualBottleneckRules: DetectionRule[] = [
  {
    name: '低測驗分數',
    condition: (metrics: LearningMetrics) => {
      const avgScore = metrics.quizScores.reduce((a, b) => a + b, 0) / 
        Math.max(1, metrics.quizScores.length)
      return avgScore < 60
    },
    weight: 8,
    bottleneckType: 'conceptual',
    severityCalculator: (metrics: LearningMetrics) => {
      const avgScore = metrics.quizScores.reduce((a, b) => a + b, 0) / 
        Math.max(1, metrics.quizScores.length)
      if (avgScore < 40) return 'critical'
      if (avgScore < 60) return 'high'
      return 'medium'
    },
    indicators: ['測驗分數持續偏低', '核心概念掌握不足']
  },
  {
    name: '高重試次數',
    condition: (metrics: LearningMetrics) => metrics.retryAttempts > 3,
    weight: 7,
    bottleneckType: 'conceptual',
    severityCalculator: (metrics: LearningMetrics) => 
      metrics.retryAttempts > 5 ? 'high' : 'medium',
    indicators: ['反覆練習同一內容', '概念理解困難']
  }
]

// 動機瓶頸規則
const motivationalBottleneckRules: DetectionRule[] = [
  {
    name: '進度停滯',
    condition: (metrics: LearningMetrics) => {
      return metrics.completionRate < 0.3 && metrics.progressVelocity < 0.1
    },
    weight: 9,
    bottleneckType: 'motivational',
    severityCalculator: (metrics: LearningMetrics) => {
      if (metrics.completionRate < 0.1) return 'critical'
      if (metrics.completionRate < 0.3) return 'high'
      return 'medium'
    },
    indicators: ['長時間無進展', '學習動機下降']
  },
  {
    name: '學習頻率低',
    condition: (metrics: LearningMetrics) => metrics.sessionFrequency < 1,
    weight: 6,
    bottleneckType: 'motivational',
    severityCalculator: (metrics: LearningMetrics) => 
      metrics.sessionFrequency < 0.5 ? 'high' : 'medium',
    indicators: ['學習頻率不足', '缺乏學習習慣']
  }
]

// 時間管理瓶頸規則
const timeBottleneckRules: DetectionRule[] = [
  {
    name: '學習時長不一致',
    condition: (metrics: LearningMetrics) => metrics.studyTimeConsistency < 0.5,
    weight: 7,
    bottleneckType: 'time',
    severityCalculator: (metrics: LearningMetrics) => 
      metrics.studyTimeConsistency < 0.3 ? 'high' : 'medium',
    indicators: ['學習時間不規律', '難以安排固定學習時間']
  },
  {
    name: '單次學習時間過短',
    condition: (metrics: LearningMetrics) => metrics.averageSessionDuration < 10,
    weight: 5,
    bottleneckType: 'time',
    severityCalculator: (metrics: LearningMetrics) => 
      metrics.averageSessionDuration < 5 ? 'high' : 'medium',
    indicators: ['學習時間碎片化', '難以深入學習']
  }
]

// 應用偵測規則
function applyDetectionRules(
  courseId: string,
  metrics: LearningMetrics
): LearningBottleneck[] {
  const bottlenecks: LearningBottleneck[] = []
  const allRules = [
    ...conceptualBottleneckRules,
    ...motivationalBottleneckRules,
    ...timeBottleneckRules
  ]
  
  allRules.forEach(rule => {
    if (rule.condition(metrics)) {
      const bottleneck: LearningBottleneck = {
        id: `bottleneck_${courseId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        courseId,
        title: generateBottleneckTitle(rule.bottleneckType),
        type: rule.bottleneckType,
        severity: rule.severityCalculator(metrics),
        detectionMethod: 'behavioral',
        indicators: rule.indicators,
        rootCause: generateRootCause(rule.bottleneckType, metrics),
        impactAreas: identifyImpactAreas(rule.bottleneckType),
        detectedAt: new Date().toISOString(),
        resolutionStatus: 'detected'
      }
      
      bottlenecks.push(bottleneck)
    }
  })
  
  return bottlenecks
}

/**
 * 3. AI 分析補充
 */

// AI 補充分析
function performAIAnalysis(
  courseId: string,
  metrics: LearningMetrics,
  existingBottlenecks: LearningBottleneck[]
): LearningBottleneck[] {
  const aiBottlenecks: LearningBottleneck[] = []
  
  // 基於模式識別的補充分析
  if (metrics.engagementScore < 30 && existingBottlenecks.length === 0) {
    aiBottlenecks.push({
      id: `ai_bottleneck_${courseId}_${Date.now()}`,
      courseId,
      title: '學習參與度不足',
      type: 'motivational',
      severity: metrics.engagementScore < 20 ? 'high' : 'medium',
      detectionMethod: 'ai_analysis',
      indicators: ['互動頻率低', '被動學習模式'],
      rootCause: '學習參與度指標偏低，可能影響學習效果',
      impactAreas: ['整體學習成效', '知識內化程度'],
      detectedAt: new Date().toISOString(),
      resolutionStatus: 'detected'
    })
  }
  
  // 基於時間模式的分析
  if (metrics.peakStudyHours.length === 0) {
    aiBottlenecks.push({
      id: `ai_time_bottleneck_${courseId}_${Date.now()}`,
      courseId,
      title: '缺乏最佳學習時段',
      type: 'time',
      severity: 'medium',
      detectionMethod: 'ai_analysis',
      indicators: ['未建立固定學習時間', '學習效率可能受影響'],
      rootCause: '尚未找到最適合的學習時間安排',
      impactAreas: ['學習效率', '時間管理'],
      detectedAt: new Date().toISOString(),
      resolutionStatus: 'detected'
    })
  }
  
  return aiBottlenecks
}

/**
 * 4. 瓶頸管理系統
 */

// 瓶頸追蹤和管理
export class BottleneckManager {
  private static instance: BottleneckManager
  private bottlenecks: LearningBottleneck[] = []
  
  private constructor() {
    this.loadBottlenecks()
  }
  
  static getInstance(): BottleneckManager {
    if (!BottleneckManager.instance) {
      BottleneckManager.instance = new BottleneckManager()
    }
    return BottleneckManager.instance
  }
  
  // 新增瓶頸
  addBottleneck(bottleneck: LearningBottleneck): void {
    this.bottlenecks.push(bottleneck)
    this.saveBottlenecks()
    this.notifyUser(bottleneck)
    logger.info('New bottleneck detected', { 
      courseId: bottleneck.courseId, 
      type: bottleneck.type,
      severity: bottleneck.severity 
    })
  }
  
  // 更新瓶頸狀態
  updateBottleneckStatus(
    bottleneckId: string,
    status: LearningBottleneck['resolutionStatus'],
    resolvedAt?: string
  ): void {
    const bottleneck = this.bottlenecks.find(b => b.id === bottleneckId)
    if (bottleneck) {
      bottleneck.resolutionStatus = status
      if (resolvedAt) {
        bottleneck.resolvedAt = resolvedAt
      }
      this.saveBottlenecks()
    }
  }
  
  // 取得特定課程的瓶頸
  getBottlenecksForCourse(courseId: string): LearningBottleneck[] {
    return this.bottlenecks.filter(b => 
      b.courseId === courseId && 
      b.resolutionStatus !== 'resolved'
    )
  }
  
  // 取得所有未解決的瓶頸
  getActiveBottlenecks(): LearningBottleneck[] {
    return this.bottlenecks.filter(b => b.resolutionStatus !== 'resolved')
  }
  
  // 按嚴重程度排序
  getBottlenecksBySeverity(): LearningBottleneck[] {
    const severityOrder: Record<SeverityLevel, number> = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    }
    
    return [...this.bottlenecks].sort((a, b) => 
      severityOrder[b.severity] - severityOrder[a.severity]
    )
  }
  
  // 儲存到 localStorage
  private saveBottlenecks(): void {
    try {
      localStorage.setItem(
        'cheersin_learning_bottlenecks',
        JSON.stringify({
          version: '1.0',
          timestamp: new Date().toISOString(),
          bottlenecks: this.bottlenecks
        })
      )
    } catch (error) {
      logger.error('Failed to save bottlenecks', { error })
    }
  }
  
  // 從 localStorage 讀取
  private loadBottlenecks(): void {
    try {
      const raw = localStorage.getItem('cheersin_learning_bottlenecks')
      if (raw) {
        const data = JSON.parse(raw)
        if (data.version === '1.0' && Array.isArray(data.bottlenecks)) {
          this.bottlenecks = data.bottlenecks
        }
      }
    } catch (error) {
      logger.error('Failed to load bottlenecks', { error })
    }
  }
  
  // 通知使用者
  private notifyUser(bottleneck: LearningBottleneck): void {
    // 未來可以整合通知系統
    if (bottleneck.severity === 'critical' || bottleneck.severity === 'high') {
      // 觸發重要通知
      logger.warn('High severity bottleneck detected', { bottleneck })
    }
  }
}

/**
 * 5. 個人化解決方案產生器
 */

// 產生個人化解決方案
export function generateBottleneckSolutions(
  bottleneck: LearningBottleneck
): {
  immediateActions: string[];
  shortTermStrategies: string[];
  longTermImprovements: string[];
  resources: string[];
  expectedTimeline: string;
} {
  const solutions = {
    immediateActions: [] as string[],
    shortTermStrategies: [] as string[],
    longTermImprovements: [] as string[],
    resources: [] as string[],
    expectedTimeline: ''
  }
  
  switch (bottleneck.type) {
    case 'conceptual':
      solutions.immediateActions = [
        '重新閱讀相關章節',
        '觀看教學影片',
        '尋求同伴討論'
      ]
      solutions.shortTermStrategies = [
        '制定概念理解計畫',
        '增加練習題目',
        '定期自我測驗'
      ]
      solutions.resources = [
        '課程重點筆記',
        '線上學習社群',
        '額外教學資源'
      ]
      solutions.expectedTimeline = '1-2 週'
      break
      
    case 'motivational':
      solutions.immediateActions = [
        '重新設定學習目標',
        '尋找學習夥伴',
        '建立獎勵機制'
      ]
      solutions.shortTermStrategies = [
        '制定可達成的小目標',
        '建立學習儀式感',
        '記錄學習進展'
      ]
      solutions.resources = [
        '學習社群支持',
        '導師指導',
        '成功案例分享'
      ]
      solutions.expectedTimeline = '2-4 週'
      break
      
    case 'time':
      solutions.immediateActions = [
        '評估每日可用時間',
        '設定固定學習時段',
        '消除學習干擾'
      ]
      solutions.shortTermStrategies = [
        '使用時間管理工具',
        '建立學習時間表',
        '優先處理重要內容'
      ]
      solutions.resources = [
        '時間管理應用',
        '番茄鐘技巧',
        '學習效率指南'
      ]
      solutions.expectedTimeline = '1-3 週'
      break
      
    default:
      solutions.immediateActions = ['分析具體問題', '尋求幫助']
      solutions.expectedTimeline = '1-2 週'
  }
  
  // 根據嚴重程度調整
  if (bottleneck.severity === 'critical') {
    solutions.immediateActions.unshift('立即暫停當前進度，專注解決瓶頸')
    solutions.expectedTimeline = '立即處理'
  }
  
  return solutions
}

/**
 * 6. 預防機制
 */

// 瓶頸預防系統
export function setupBottleneckPrevention(courseId: string): void {
  // 設定預防性監控
  const preventionRules = [
    {
      trigger: 'completion_stall',
      condition: () => {
        // 監控進度停滯
        return false // 實際實作中需要實時監控
      },
      action: () => {
        // 提前介入
        logger.info('Preventive action triggered for course', { courseId })
      }
    }
  ]
  
  // 實際實作中需要設定定時檢查機制
  logger.info('Bottleneck prevention system initialized', { courseId })
}

/**
 * 7. 輔助函數
 */

// 計算進度速度
function calculateProgressVelocity(courseId: string): number {
  // 簡化的計算邏輯
  return 0.5 // 實際實作中需要基於時間序列數據
}

// 取得課程開始日期
function getCourseStartDate(courseId: string): number {
  // 從進度資料中取得
  return Date.now() - 7 * 24 * 60 * 60 * 1000 // 預設 7 天前
}

// 取得互動資料
function getInteractionData(courseId: string): { 
  sessionCount: number; 
  totalTime: number 
} {
  // 實際實作中從 analytics 取得
  return { sessionCount: 5, totalTime: 150 } // 預設值
}

// 計算參與度分數
function calculateEngagementScore(_data: { sessionCount: number; totalTime: number }): number {
  // 基於互動頻率、時間、深度等計算
  return 65 // 預設值
}

// 取得測驗分數
function getQuizScores(courseId: string): number[] {
  // 實際實作中從測驗系統取得
  return [75, 80, 65] // 預設值
}

// 計算重試次數
function countRetryAttempts(courseId: string): number {
  // 實際實作中從學習記錄取得
  return 2 // 預設值
}

// 計算求助次數
function countHelpRequests(courseId: string): number {
  // 實際實作中從支援系統取得
  return 1 // 預設值
}

// 計算課程間平均時間
function calculateAverageTimeBetweenSessions(courseId: string): number {
  return 24 // 小時
}

// 計算時間一致性
function calculateTimeConsistency(courseId: string): number {
  return 0.7 // 0-1 之間的值
}

// 分析高峰學習時間
function analyzePeakStudyHours(courseId: string): number[] {
  return [9, 14, 20] // 預設高峰時間
}

// 產生瓶頸標題
function generateBottleneckTitle(type: BottleneckType): string {
  const titles: Record<BottleneckType, string> = {
    'conceptual': '概念理解困難',
    'practical': '實作技能不足',
    'motivational': '學習動機不足',
    'time': '時間管理問題',
    'resource': '學習資源不足',
    'technical': '技術使用障礙'
  }
  return titles[type]
}

// 產生根本原因
function generateRootCause(type: BottleneckType, metrics: LearningMetrics): string {
  const causes: Record<BottleneckType, string> = {
    'conceptual': '核心概念理解不夠深入，需要加強基礎',
    'practical': '缺乏實際操作經驗，需要更多練習',
    'motivational': '學習目標不明確或缺乏持續動機',
    'time': '時間安排不當，學習效率受影響',
    'resource': '缺乏適當的學習材料或工具',
    'technical': '對學習平台或工具使用不熟悉'
  }
  return causes[type]
}

// 識別影響領域
function identifyImpactAreas(type: BottleneckType): string[] {
  const impacts: Record<BottleneckType, string[]> = {
    'conceptual': ['知識掌握', '學習進度', '考試表現'],
    'practical': ['技能應用', '實際操作', '問題解決'],
    'motivational': ['學習持續性', '整體進度', '學習滿意度'],
    'time': ['學習效率', '進度完成', '壓力管理'],
    'resource': ['學習品質', '理解深度', '學習體驗'],
    'technical': ['學習體驗', '操作效率', '參與度']
  }
  return impacts[type]
}

// 瓶頸去重
function deduplicateBottlenecks(bottlenecks: LearningBottleneck[]): LearningBottleneck[] {
  const uniqueBottlenecks = new Map<string, LearningBottleneck>()
  
  bottlenecks.forEach(bottleneck => {
    const key = `${bottleneck.courseId}_${bottleneck.type}`
    const existing = uniqueBottlenecks.get(key)
    
    if (!existing || getSeverityScore(bottleneck.severity) > getSeverityScore(existing.severity)) {
      uniqueBottlenecks.set(key, bottleneck)
    }
  })
  
  return Array.from(uniqueBottlenecks.values())
}

// 嚴重度評分
function getSeverityScore(severity: SeverityLevel): number {
  const scores: Record<SeverityLevel, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  }
  return scores[severity]
}

/**
 * 8. 主要使用介面
 */

export function useBottleneckDetection(courseId: string): {
  bottlenecks: LearningBottleneck[];
  manager: BottleneckManager;
  detect: () => void;
  getSolutions: (bottleneck: LearningBottleneck) => ReturnType<typeof generateBottleneckSolutions>;
} {
  const manager = BottleneckManager.getInstance()
  const bottlenecks = manager.getBottlenecksForCourse(courseId)
  
  const detect = () => {
    const newBottlenecks = detectLearningBottlenecks(courseId)
    newBottlenecks.forEach(bottleneck => {
      if (!bottlenecks.some(b => b.id === bottleneck.id)) {
        manager.addBottleneck(bottleneck)
      }
    })
  }
  
  const getSolutions = (bottleneck: LearningBottleneck) => {
    return generateBottleneckSolutions(bottleneck)
  }
  
  return {
    bottlenecks,
    manager,
    detect,
    getSolutions
  }
}