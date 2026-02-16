/**
 * P3-04：知識掌握度評估機制
 * 透過測驗、互動、行為分析來評估使用者對知識的掌握程度
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

// 知識掌握度評估結果
export interface KnowledgeAssessment {
  courseId: string
  title: string
  overallScore: number // 0-100
  domainScores: Record<string, number> // 各知識領域得分
  assessmentMethod: 'quiz' | 'practice' | 'behavioral' | 'combined'
  confidenceLevel: 'high' | 'medium' | 'low'
  lastAssessed: string
  nextAssessmentDue: string
}

// 測驗題目結構
export interface QuizQuestion {
  id: string
  courseId: string
  domain: string // 知識領域
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
}

// 測驗結果
export interface QuizResult {
  questionId: string
  userAnswer: number
  isCorrect: boolean
  timeSpent: number // 秒
  confidence: 'guessing' | 'unsure' | 'confident'
}

// 實際評估記錄
export interface AssessmentRecord {
  id: string
  courseId: string
  assessmentType: 'quiz' | 'practice' | 'behavioral'
  score: number
  timestamp: string
  details: Record<string, unknown>
}

// 知識領域定義
const KNOWLEDGE_DOMAINS = [
  '葡萄酒基礎',
  '烈酒知識',
  '品飲技巧',
  '產區認識',
  '釀造工藝',
  '商業知識',
  '法規認證'
] as const

export type KnowledgeDomain = typeof KNOWLEDGE_DOMAINS[number]

/**
 * 1. 測驗系統
 */

// 產生適應性測驗
export function generateAdaptiveQuiz(
  courseId: string,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): QuizQuestion[] {
  const questions = getQuestionsForCourse(courseId)
  if (questions.length === 0) return []
  
  // 根據使用者水平調整難度
  const filteredQuestions = questions.filter(q => {
    if (userLevel === 'beginner') return q.difficulty === 'easy'
    if (userLevel === 'intermediate') return q.difficulty !== 'hard'
    return true // advanced 可以所有難度
  })
  
  // 選擇各領域平衡的題目
  const domainGroups = groupQuestionsByDomain(filteredQuestions)
  const quizQuestions: QuizQuestion[] = []
  
  // 每個領域選 2-3 題
  Object.values(domainGroups).forEach(group => {
    const count = Math.min(3, Math.ceil(group.length * 0.3))
    const selected = shuffleArray(group).slice(0, count)
    quizQuestions.push(...selected)
  })
  
  return shuffleArray(quizQuestions).slice(0, 10) // 限制 10 題
}

// 評分測驗結果
export function gradeQuiz(
  questions: QuizQuestion[],
  results: QuizResult[]
): {
  overallScore: number;
  domainScores: Record<string, number>;
  detailedAnalysis: {
    domain: string;
    score: number;
    correctCount: number;
    totalCount: number;
  }[];
} {
  const domainStats: Record<string, { correct: number; total: number }> = {}
  
  results.forEach((result, index) => {
    const question = questions[index]
    if (!question) return
    
    if (!domainStats[question.domain]) {
      domainStats[question.domain] = { correct: 0, total: 0 }
    }
    
    domainStats[question.domain].total += 1
    if (result.isCorrect) {
      domainStats[question.domain].correct += 1
    }
  })
  
  // 計算各領域分數
  const domainScores: Record<string, number> = {}
  const detailedAnalysis = Object.entries(domainStats).map(([domain, stats]) => {
    const score = Math.round((stats.correct / stats.total) * 100)
    domainScores[domain] = score
    return {
      domain,
      score,
      correctCount: stats.correct,
      totalCount: stats.total
    }
  })
  
  // 計算總體分數
  const overallScore = Math.round(
    detailedAnalysis.reduce((sum, analysis) => sum + analysis.score, 0) / 
    detailedAnalysis.length
  )
  
  return {
    overallScore,
    domainScores,
    detailedAnalysis
  }
}

/**
 * 2. 行為分析評估
 */

// 透過學習行為評估知識掌握度
export function assessKnowledgeThroughBehavior(
  courseId: string,
  progress: ProgressEntry
): number {
  let score = 0
  const totalWeight = 100
  
  // 1. 完成度 (40%)
  const completionScore = (progress.completed / progress.total) * 40
  score += completionScore
  
  // 2. 完成時間 (20%)
  if (progress.completedAt) {
    const daysToComplete = (Date.now() - new Date(progress.completedAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    
    // 較快完成得分較高
    const timeScore = Math.max(0, 20 - (daysToComplete * 0.5))
    score += timeScore
  }
  
  // 3. 重複學習 (20%)
  // 未來可以從學習歷史中分析重複訪問模式
  const repeatScore = Math.min(20, progress.completed * 2)
  score += repeatScore
  
  // 4. 長期保持 (20%)
  if (progress.completedAt) {
    const retentionDays = (Date.now() - new Date(progress.completedAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    
    // 時間越長保持得分越高
    const retentionScore = Math.min(20, retentionDays * 0.1)
    score += retentionScore
  }
  
  return Math.min(100, Math.round(score))
}

// 綜合知識評估
export function comprehensiveKnowledgeAssessment(
  courseId: string
): KnowledgeAssessment {
  const progress = loadProgress()
  const courseProgress = progress[courseId]
  
  if (!courseProgress) {
    return {
      courseId,
      title: getCourseTitle(courseId),
      overallScore: 0,
      domainScores: {},
      assessmentMethod: 'combined',
      confidenceLevel: 'low',
      lastAssessed: new Date().toISOString(),
      nextAssessmentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  // 1. 行為分析評估
  const behavioralScore = assessKnowledgeThroughBehavior(courseId, courseProgress)
  
  // 2. 測驗評估（如果有的話）
  const quizHistory = getQuizHistory(courseId)
  let quizScore = 0
  if (quizHistory.length > 0) {
    const latestQuiz = quizHistory[quizHistory.length - 1]
    quizScore = latestQuiz.score
  }
  
  // 3. 綜合評分
  let overallScore: number
  let assessmentMethod: KnowledgeAssessment['assessmentMethod']
  let confidenceLevel: KnowledgeAssessment['confidenceLevel']
  
  if (quizHistory.length > 0) {
    // 有測驗資料，加權計算
    overallScore = Math.round(behavioralScore * 0.6 + quizScore * 0.4)
    assessmentMethod = 'combined'
    confidenceLevel = 'high'
  } else {
    // 僅有行為資料
    overallScore = behavioralScore
    assessmentMethod = 'behavioral'
    confidenceLevel = courseProgress.completed >= courseProgress.total ? 'medium' : 'low'
  }
  
  // 4. 各領域得分（基於課程內容）
  const domainScores = estimateDomainScores(courseId, overallScore)
  
  return {
    courseId,
    title: getCourseTitle(courseId),
    overallScore,
    domainScores,
    assessmentMethod,
    confidenceLevel,
    lastAssessed: new Date().toISOString(),
    nextAssessmentDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }
}

// 估算各領域得分
function estimateDomainScores(
  courseId: string,
  overallScore: number
): Record<string, number> {
  const courseDomains = getCourseDomains(courseId)
  const domainScores: Record<string, number> = {}
  
  // 平均分配到各領域，加上小幅度隨機變異
  const baseScore = overallScore
  const variance = 10
  
  courseDomains.forEach(domain => {
    const adjustment = Math.random() * variance * 2 - variance
    domainScores[domain] = Math.max(0, Math.min(100, Math.round(baseScore + adjustment)))
  })
  
  return domainScores
}

/**
 * 3. 學習瓶頸識別系統
 */

// 自動識別知識盲點
export function identifyKnowledgeBlindSpots(
  courseId: string,
  assessment: KnowledgeAssessment
): {
  domain: string;
  weaknessLevel: 'mild' | 'moderate' | 'severe';
  recommendedActions: string[];
}[] {
  const blindSpots: {
    domain: string;
    weaknessLevel: 'mild' | 'moderate' | 'severe';
    recommendedActions: string[];
  }[] = []
  
  Object.entries(assessment.domainScores).forEach(([domain, score]) => {
    let weaknessLevel: 'mild' | 'moderate' | 'severe' = 'mild'
    const recommendedActions: string[] = []
    
    if (score < 60) {
      weaknessLevel = 'severe'
      recommendedActions.push(
        '重新學習基礎概念',
        '尋求額外練習題',
        '參加相關討論'
      )
    } else if (score < 80) {
      weaknessLevel = 'moderate'
      recommendedActions.push(
        '複習相關章節',
        '進行針對性練習'
      )
    } else if (score < 90) {
      weaknessLevel = 'mild'
      recommendedActions.push('快速複習重點')
    }
    
    if (weaknessLevel !== 'mild') {
      blindSpots.push({
        domain,
        weaknessLevel,
        recommendedActions
      })
    }
  })
  
  return blindSpots
}

// 產生個人化學習建議
export function generateKnowledgeBasedRecommendations(
  courseId: string,
  assessment: KnowledgeAssessment
): {
  priority: 'high' | 'medium' | 'low';
  action: string;
  estimatedTime: string;
  expectedImprovement: number;
}[] {
  const recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    estimatedTime: string;
    expectedImprovement: number;
  }[] = []
  const blindSpots = identifyKnowledgeBlindSpots(courseId, assessment)
  
  // 基於盲點的建議
  blindSpots.forEach(spot => {
    const priority = spot.weaknessLevel === 'severe' ? 'high' : 
                   spot.weaknessLevel === 'moderate' ? 'medium' : 'low'
    
    recommendations.push({
      priority,
      action: `加強${spot.domain}領域學習`,
      estimatedTime: spot.weaknessLevel === 'severe' ? '2-3小時' : 
                    spot.weaknessLevel === 'moderate' ? '1-2小時' : '30-60分鐘',
      expectedImprovement: spot.weaknessLevel === 'severe' ? 30 : 
                          spot.weaknessLevel === 'moderate' ? 20 : 10
    })
  })
  
  // 基於整體掌握度的建議
  if (assessment.overallScore < 70) {
    recommendations.push({
      priority: 'high',
      action: '制定系統性複習計畫',
      estimatedTime: '3-5小時',
      expectedImprovement: 25
    })
  } else if (assessment.overallScore < 90) {
    recommendations.push({
      priority: 'medium',
      action: '針對性強化練習',
      estimatedTime: '1-2小時',
      expectedImprovement: 15
    })
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * 4. 持續追蹤系統
 */

// 追蹤學習進度變化
export function trackKnowledgeEvolution(
  courseId: string,
  timeframe: 'week' | 'month' | 'quarter' = 'month'
): {
  trend: 'improving' | 'declining' | 'stable';
  changeAmount: number;
  assessmentHistory: AssessmentRecord[];
} {
  const history = getAssessmentHistory(courseId, timeframe)
  
  if (history.length < 2) {
    return {
      trend: 'stable',
      changeAmount: 0,
      assessmentHistory: history
    }
  }
  
  const firstScore = history[0].score
  const lastScore = history[history.length - 1].score
  const change = lastScore - firstScore
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (change > 5) trend = 'improving'
  else if (change < -5) trend = 'declining'
  
  return {
    trend,
    changeAmount: Math.abs(change),
    assessmentHistory: history
  }
}

// 預測未來掌握度
export function predictFutureMastery(
  courseId: string,
  currentAssessment: KnowledgeAssessment
): {
  predictedScore: number;
  confidenceInterval: [number, number];
  timeToMastery: string;
  recommendedNextSteps: string[];
} {
  const evolution = trackKnowledgeEvolution(courseId, 'month')
  const currentScore = currentAssessment.overallScore
  
  // 基於學習趨勢預測
  let predictedScore: number
  if (evolution.trend === 'improving') {
    predictedScore = Math.min(100, currentScore + evolution.changeAmount)
  } else if (evolution.trend === 'declining') {
    predictedScore = Math.max(0, currentScore - evolution.changeAmount)
  } else {
    predictedScore = currentScore
  }
  
  // 信心區間
  const confidenceMargin = 10
  const confidenceInterval: [number, number] = [
    Math.max(0, predictedScore - confidenceMargin),
    Math.min(100, predictedScore + confidenceMargin)
  ]
  
  // 預估達成精通時間
  const pointsNeeded = Math.max(0, 90 - predictedScore)
  const timeToMastery = pointsNeeded > 0 ? 
    `${Math.ceil(pointsNeeded / 5)} 週` : '已達精通'
  
  // 下一步建議
  const nextSteps = []
  if (predictedScore < 80) {
    nextSteps.push('加強練習頻率', '尋求同伴學習')
  }
  if (predictedScore < 90) {
    nextSteps.push('進行進階挑戰')
  }
  if (predictedScore >= 90) {
    nextSteps.push('幫助他人學習', '探索相關領域')
  }
  
  return {
    predictedScore,
    confidenceInterval,
    timeToMastery,
    recommendedNextSteps: nextSteps
  }
}

/**
 * 5. 輔助函數和資料存取
 */

// 取得課程題目
function getQuestionsForCourse(courseId: string): QuizQuestion[] {
  // 實際實作中應該從資料庫或 API 取得
  const questionBank: Record<string, QuizQuestion[]> = {
    'wine-basics': [
      {
        id: 'wb-1',
        courseId: 'wine-basics',
        domain: '葡萄酒基礎',
        question: '葡萄酒的主要成分是什麼？',
        options: ['水和酒精', '糖和酵母', '葡萄和時間', '以上皆是'],
        correctAnswer: 3,
        difficulty: 'easy',
        explanation: '葡萄酒是透過葡萄發酵產生的複雜飲品，主要成分包括水、酒精、糖分、酸類等。'
      },
      {
        id: 'wb-2',
        courseId: 'wine-basics',
        domain: '品飲技巧',
        question: '品酒時應該先觀察什麼？',
        options: ['香氣', '顏色', '口感', '酒標'],
        correctAnswer: 1,
        difficulty: 'easy',
        explanation: '品酒的第一步是觀察酒液的顏色和清澈度，這能提供關於酒齡和品質的重要資訊。'
      }
    ]
  }
  
  return questionBank[courseId] || []
}

// 題目分組
function groupQuestionsByDomain(questions: QuizQuestion[]): Record<string, QuizQuestion[]> {
  const groups: Record<string, QuizQuestion[]> = {}
  
  questions.forEach(question => {
    if (!groups[question.domain]) {
      groups[question.domain] = []
    }
    groups[question.domain].push(question)
  })
  
  return groups
}

// 陣列隨機排序
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 取得測驗歷史
function getQuizHistory(courseId: string): AssessmentRecord[] {
  // 實際實作中應該從資料庫取得
  return []
}

// 取得評估歷史
function getAssessmentHistory(
  courseId: string, 
  timeframe: string
): AssessmentRecord[] {
  // 實際實作中應該從資料庫取得
  return []
}

// 取得課程標題
function getCourseTitle(courseId: string): string {
  const titles: Record<string, string> = {
    'wine-basics': '葡萄酒入門',
    'wset-l1-spirits': 'WSET L1 烈酒入門',
    'wset-l2-wines': 'WSET L2 葡萄酒產區'
  }
  
  return titles[courseId] || courseId
}

// 取得課程知識領域
function getCourseDomains(courseId: string): string[] {
  const domainMap: Record<string, string[]> = {
    'wine-basics': ['葡萄酒基礎', '品飲技巧'],
    'wset-l1-spirits': ['烈酒知識', '品飲技巧'],
    'wset-l2-wines': ['產區認識', '葡萄酒基礎']
  }
  
  return domainMap[courseId] || ['綜合知識']
}

/**
 * 6. 主要使用介面
 */

export function useKnowledgeAssessment(courseId: string): {
  currentAssessment: KnowledgeAssessment;
  blindSpots: ReturnType<typeof identifyKnowledgeBlindSpots>;
  recommendations: ReturnType<typeof generateKnowledgeBasedRecommendations>;
  evolution: ReturnType<typeof trackKnowledgeEvolution>;
  prediction: ReturnType<typeof predictFutureMastery>;
  refresh: () => void;
} {
  const currentAssessment = comprehensiveKnowledgeAssessment(courseId)
  const blindSpots = identifyKnowledgeBlindSpots(courseId, currentAssessment)
  const recommendations = generateKnowledgeBasedRecommendations(courseId, currentAssessment)
  const evolution = trackKnowledgeEvolution(courseId)
  const prediction = predictFutureMastery(courseId, currentAssessment)
  
  const refresh = () => {
    logger.info('Knowledge assessment refreshed', { courseId })
  }
  
  return {
    currentAssessment,
    blindSpots,
    recommendations,
    evolution,
    prediction,
    refresh
  }
}