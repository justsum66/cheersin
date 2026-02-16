/**
 * P3-02：AI 驅動的個人化學習路徑推薦系統
 * 整合使用者偏好、學習進度、AI 分析來提供智慧學習建議
 */

import type { PlanGoal, PlanStep } from './learn-plan-generator'
import { getPlanByGoal } from './learn-plan-generator'
import { loadUserPreferences, type UserPreferences } from './chat-history'
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

// 學習者分析資料
export interface LearnerProfile {
  // 基本資訊
  totalCoursesCompleted: number
  currentLearningGoal?: PlanGoal
  learningPace: 'fast' | 'medium' | 'slow'
  
  // 專業領域興趣
  interestAreas: string[]
  preferredCertifications: PlanGoal[]
  
  // 學習行為模式
  peakLearningTime?: 'morning' | 'afternoon' | 'evening'
  sessionDurationPreference: 'short' | 'medium' | 'long'
  completionRate: number
}

// 課程相容性評分
export interface CourseCompatibility {
  courseId: string
  title: string
  compatibilityScore: number // 0-100
  reasoning: string[]
  estimatedCompletionTime: number // 分鐘
  prerequisitesMet: boolean
  skillGap: string[]
}

// 個人化學習路徑
export interface PersonalizedLearningPath {
  recommendedPath: PlanStep[]
  alternativePaths: PlanStep[][]
  nextCourse: string | null
  estimatedTimeline: {
    weeks: number
    milestones: { week: number; goal: string }[]
  }
  confidenceLevel: 'high' | 'medium' | 'low'
}

/**
 * 1. 學習者分析引擎
 */

// 建立學習者檔案
export function buildLearnerProfile(): LearnerProfile {
  const progress = loadProgress()
  const preferences = loadUserPreferences()
  
  // 計算完成的課程數
  const completedCourses = Object.entries(progress).filter(
    ([_, p]) => (p as ProgressEntry).completed >= (p as ProgressEntry).total
  ).length
  
  // 分析學習節奏
  const learningPace = analyzeLearningPace(progress)
  
  // 識別興趣領域
  const interestAreas = identifyInterestAreas(progress, preferences)
  
  // 計算完成率
  const completionRate = calculateCompletionRate(progress)
  
  return {
    totalCoursesCompleted: completedCourses,
    currentLearningGoal: preferences.learningGoals?.[0] as PlanGoal || 'WSET',
    learningPace,
    interestAreas,
    preferredCertifications: (preferences.learningGoals || ['WSET']) as PlanGoal[],
    sessionDurationPreference: preferences.preferredLearningStyle === 'kinesthetic' ? 'long' : 'medium',
    completionRate
  }
}

// 分析學習節奏
function analyzeLearningPace(progress: Record<string, ProgressEntry>): 'fast' | 'medium' | 'slow' {
  const entries = Object.values(progress)
  if (entries.length === 0) return 'medium'
  
  // 計算平均完成時間（假設每課需要時間）
  const totalCompleted = entries.reduce((sum, p) => sum + p.completed, 0)
  const totalTimeSpent = entries.length * 30 // 假設每課平均 30 分鐘
  
  if (totalTimeSpent < 100) return 'fast'
  if (totalTimeSpent > 500) return 'slow'
  return 'medium'
}

// 識別興趣領域
function identifyInterestAreas(
  progress: Record<string, ProgressEntry>,
  preferences: UserPreferences
): string[] {
  const interests = new Set<string>()
  
  // 從已完成課程推斷
  Object.entries(progress).forEach(([courseId, p]) => {
    if (p.completed >= p.total) {
      const category = getCourseCategory(courseId)
      if (category) interests.add(category)
    }
  })
  
  // 從使用者偏好推斷
  if (preferences.learningGoals?.includes('WSET')) interests.add('葡萄酒')
  if (preferences.learningGoals?.includes('CMS')) interests.add('侍酒師')
  if (preferences.learningGoals?.includes('MW')) interests.add('專業認證')
  
  if (preferences.flavorPreferences?.some(f => f.includes('烈酒'))) interests.add('烈酒')
  if (preferences.flavorPreferences?.some(f => f.includes('清酒'))) interests.add('清酒')
  
  return Array.from(interests)
}

// 計算完成率
function calculateCompletionRate(progress: Record<string, ProgressEntry>): number {
  if (Object.keys(progress).length === 0) return 0
  
  const totalProgress = Object.values(progress).reduce(
    (sum, p) => sum + (p.completed / p.total),
    0
  )
  
  return Math.round((totalProgress / Object.keys(progress).length) * 100)
}

// 取得課程分類
function getCourseCategory(courseId: string): string | null {
  const categoryMap: Record<string, string> = {
    'wine-basics': '葡萄酒',
    'whisky-101': '烈酒',
    'sake-intro': '清酒',
    'beer-fundamentals': '啤酒',
    'wset-l1-spirits': '烈酒',
    'wset-l2-wines': '葡萄酒',
    'wset-l3-viticulture': '葡萄酒',
    'wset-l3-tasting': '品飲',
  }
  
  return categoryMap[courseId] || null
}

/**
 * 2. 課程相容性評估
 */

// 評估課程相容性
export function assessCourseCompatibility(
  courseId: string,
  learnerProfile: LearnerProfile
): CourseCompatibility {
  const course = getCourseInfo(courseId)
  if (!course) {
    return {
      courseId,
      title: '未知課程',
      compatibilityScore: 0,
      reasoning: ['課程不存在'],
      estimatedCompletionTime: 0,
      prerequisitesMet: false,
      skillGap: []
    }
  }
  
  const reasoning: string[] = []
  let score = 50 // 基礎分數
  const skillGap: string[] = []
  
  // 1. 興趣匹配 (0-20分)
  if (learnerProfile.interestAreas.some(area => course.categories.includes(area))) {
    score += 20
    reasoning.push('符合學習興趣')
  } else {
    reasoning.push('與當前興趣匹配度較低')
  }
  
  // 2. 難度適配 (0-15分)
  const difficultyMatch = assessDifficultyMatch(course.difficulty, learnerProfile.learningPace)
  score += difficultyMatch.score
  reasoning.push(difficultyMatch.reason)
  
  // 3. 學習目標一致性 (0-15分)
  if (learnerProfile.currentLearningGoal === course.certification) {
    score += 15
    reasoning.push('與學習目標一致')
  }
  
  // 4. 先備知識檢查
  const prereqCheck = checkPrerequisites(course.prerequisites, courseId)
  if (prereqCheck.met) {
    score += 10
    reasoning.push('先備知識已具備')
  } else {
    skillGap.push(...prereqCheck.missing)
    reasoning.push(`需要先完成: ${prereqCheck.missing.join(', ')}`)
  }
  
  // 5. 完成率調整
  score = Math.round(score * (learnerProfile.completionRate / 100))
  
  return {
    courseId: course.id,
    title: course.title,
    compatibilityScore: Math.max(0, Math.min(100, score)),
    reasoning,
    estimatedCompletionTime: course.estimatedMinutes,
    prerequisitesMet: prereqCheck.met,
    skillGap
  }
}

// 難度匹配評估
function assessDifficultyMatch(
  courseDifficulty: number,
  learnerPace: 'fast' | 'medium' | 'slow'
): { score: number; reason: string } {
  const paceScores: Record<string, number> = {
    fast: 3,    // 快速學習者適合更有挑戰性的課程
    medium: 2,  // 中等學習者適合中等難度
    slow: 1     // 慢速學習者適合較簡單的課程
  }
  
  const learnerScore = paceScores[learnerPace] || 2
  const difficultyScore = Math.abs(learnerScore - courseDifficulty)
  
  if (difficultyScore === 0) {
    return { score: 15, reason: '難度完全匹配' }
  } else if (difficultyScore === 1) {
    return { score: 10, reason: '難度大致適合' }
  } else {
    return { score: 5, reason: '難度可能較高或較低' }
  }
}

// 檢查先備知識
function checkPrerequisites(prerequisites: string[], currentCourseId: string): 
  { met: boolean; missing: string[] } {
  const progress = loadProgress()
  const missing: string[] = []
  
  prerequisites.forEach(prereqId => {
    const courseProgress = progress[prereqId]
    if (!courseProgress || courseProgress.completed < courseProgress.total) {
      missing.push(getCourseTitle(prereqId))
    }
  })
  
  return {
    met: missing.length === 0,
    missing
  }
}

// 課程資訊
interface CourseInfo {
  id: string
  title: string
  difficulty: number // 1-5 (1=入門, 5=專家)
  categories: string[]
  certification: PlanGoal
  estimatedMinutes: number
  prerequisites: string[]
}

function getCourseInfo(courseId: string): CourseInfo | null {
  const courseMap: Record<string, CourseInfo> = {
    'wine-basics': {
      id: 'wine-basics',
      title: '葡萄酒入門',
      difficulty: 1,
      categories: ['葡萄酒'],
      certification: 'WSET',
      estimatedMinutes: 45,
      prerequisites: []
    },
    'wset-l1-spirits': {
      id: 'wset-l1-spirits',
      title: 'WSET L1 烈酒入門',
      difficulty: 2,
      categories: ['烈酒'],
      certification: 'WSET',
      estimatedMinutes: 120,
      prerequisites: ['wine-basics']
    },
    'wset-l2-wines': {
      id: 'wset-l2-wines',
      title: 'WSET L2 葡萄酒產區',
      difficulty: 3,
      categories: ['葡萄酒'],
      certification: 'WSET',
      estimatedMinutes: 180,
      prerequisites: ['wine-basics']
    }
  }
  
  return courseMap[courseId] || null
}

function getCourseTitle(courseId: string): string {
  const course = getCourseInfo(courseId)
  return course?.title || courseId
}

/**
 * 3. 個人化學習路徑生成
 */

// 產生個人化學習路徑
export function generatePersonalizedLearningPath(
  learnerProfile: LearnerProfile
): PersonalizedLearningPath {
  const availablePlans = learnerProfile.preferredCertifications.map(goal => 
    getPlanForGoal(goal)
  ).filter(Boolean) as PlanStep[][]
  
  if (availablePlans.length === 0) {
    return createDefaultPath(learnerProfile)
  }
  
  // 選擇最適合的計畫
  const primaryPlan = selectBestPlan(availablePlans, learnerProfile)
  const recommendedPath = filterRecommendedPath(primaryPlan, learnerProfile)
  
  // 產生替代路徑
  const alternativePaths = generateAlternativePaths(availablePlans, learnerProfile)
    .slice(0, 2) // 限制 2 個替代方案
  
  // 計算時間線
  const estimatedTimeline = calculateTimeline(recommendedPath, learnerProfile)
  
  // 評估信心水平
  const confidenceLevel = assessConfidenceLevel(learnerProfile)
  
  return {
    recommendedPath,
    alternativePaths,
    nextCourse: recommendedPath[0]?.courseId || null,
    estimatedTimeline,
    confidenceLevel
  }
}

// 為特定目標取得計畫
function getPlanForGoal(goal: PlanGoal): PlanStep[] {
  return getPlanByGoal(goal)
}

// 選擇最佳計畫
function selectBestPlan(plans: PlanStep[][], profile: LearnerProfile): PlanStep[] {
  if (plans.length === 1) return plans[0]
  
  // 根據興趣和已完成課程評分
  const scoredPlans = plans.map(plan => ({
    plan,
    score: scorePlan(plan, profile)
  }))
  
  return scoredPlans.sort((a, b) => b.score - a.score)[0].plan
}

// 為計畫評分
function scorePlan(plan: PlanStep[], profile: LearnerProfile): number {
  let score = 0
  
  // 興趣匹配
  const planCategories = plan.flatMap(step => 
    getCourseCategories(step.courseId)
  )
  
  const interestMatches = planCategories.filter(cat => 
    profile.interestAreas.includes(cat)
  ).length
  
  score += interestMatches * 10
  
  // 學習目標一致性
  const goalMatch = plan.some(step => 
    step.certLabel.includes(profile.currentLearningGoal || 'WSET')
  )
  
  if (goalMatch) score += 20
  
  return score
}

// 取得課程分類
function getCourseCategories(courseId: string): string[] {
  const course = getCourseInfo(courseId)
  return course ? course.categories : []
}

// 過濾推薦路徑
function filterRecommendedPath(plan: PlanStep[], profile: LearnerProfile): PlanStep[] {
  const progress = loadProgress()
  const completedCourseIds = Object.entries(progress)
    .filter(([, p]) => (p as ProgressEntry).completed >= (p as ProgressEntry).total)
    .map(([id]) => id)
  
  // 過濾掉已完成的課程
  return plan.filter(step => !completedCourseIds.includes(step.courseId))
}

// 產生替代路徑
function generateAlternativePaths(plans: PlanStep[][], profile: LearnerProfile): PlanStep[][] {
  return plans
    .filter(plan => plan.length > 1)
    .slice(0, 3)
    .map(plan => filterRecommendedPath(plan, profile))
    .filter(path => path.length > 0)
}

// 計算時間線
function calculateTimeline(
  path: PlanStep[], 
  profile: LearnerProfile
): { weeks: number; milestones: { week: number; goal: string }[] } {
  const estimatedWeeks = Math.ceil(
    path.reduce((total, step) => {
      const course = getCourseInfo(step.courseId)
      return total + (course?.estimatedMinutes || 60)
    }, 0) / (profile.sessionDurationPreference === 'short' ? 90 : 
            profile.sessionDurationPreference === 'long' ? 240 : 150)
  )
  
  const milestones = path
    .filter((_, index) => index % 3 === 0) // 每3個課程一個里程碑
    .map((step, index) => ({
      week: Math.round((index + 1) * (estimatedWeeks / (path.length / 3))),
      goal: `完成: ${step.title}`
    }))
  
  return {
    weeks: Math.max(1, estimatedWeeks),
    milestones
  }
}

// 評估信心水平
function assessConfidenceLevel(profile: LearnerProfile): 'high' | 'medium' | 'low' {
  const factors = [
    profile.completionRate >= 80 ? 1 : 0,
    profile.interestAreas.length >= 2 ? 1 : 0,
    profile.learningPace !== 'slow' ? 1 : 0,
    profile.totalCoursesCompleted >= 5 ? 1 : 0
  ]
  
  const positiveFactors = factors.filter(f => f === 1).length
  
  if (positiveFactors >= 3) return 'high'
  if (positiveFactors >= 1) return 'medium'
  return 'low'
}

// 建立預設路徑
function createDefaultPath(profile: LearnerProfile): PersonalizedLearningPath {
  const plan = getPlanForGoal(profile.currentLearningGoal || 'WSET')
  const path = filterRecommendedPath(plan, profile)
  
  return {
    recommendedPath: path.slice(0, 5), // 限制5門課程
    alternativePaths: [],
    nextCourse: path[0]?.courseId || null,
    estimatedTimeline: {
      weeks: 8,
      milestones: [{ week: 4, goal: '基礎掌握' }]
    },
    confidenceLevel: 'medium'
  }
}

/**
 * 4. 使用範例
 */
export function useAIRecommendationEngine(): {
  profile: LearnerProfile;
  recommendPath: () => PersonalizedLearningPath;
  compatibilityFor: (courseId: string) => CourseCompatibility;
} {
  const profile = buildLearnerProfile()
  
  return {
    profile,
    recommendPath: () => generatePersonalizedLearningPath(profile),
    compatibilityFor: (courseId: string) => assessCourseCompatibility(courseId, profile)
  }
}