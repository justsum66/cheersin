/**
 * P2.B1.1 學習計劃生成器
 * 依目標 WSET / CMS / MW 回傳建議課程 ID 順序（個人化計劃）
 */
export type PlanGoal = 'WSET' | 'CMS' | 'MW'

export interface PlanStep {
  courseId: string
  title: string
  certLabel: string
}

/** WSET 認證路徑：入門 → L1 → L2 → L3 → Diploma 對應課程 */
const WSET_PLAN: PlanStep[] = [
  { courseId: 'wine-basics', title: '葡萄酒入門', certLabel: 'WSET' },
  { courseId: 'whisky-101', title: '威士忌基礎', certLabel: 'WSET' },
  { courseId: 'wset-l1-spirits', title: 'WSET L1 烈酒入門', certLabel: 'WSET L1' },
  { courseId: 'wset-l2-wines', title: 'WSET L2 葡萄酒產區', certLabel: 'WSET L2' },
  { courseId: 'wset-l3-viticulture', title: '葡萄栽培與風土', certLabel: 'WSET L3' },
  { courseId: 'wset-l3-tasting', title: '系統化品飲分析', certLabel: 'WSET L3' },
  { courseId: 'fortified-wines', title: '加烈酒：波特與雪莉', certLabel: 'WSET' },
  { courseId: 'wset-d1-production', title: '葡萄酒生產原理', certLabel: 'WSET D1' },
  { courseId: 'wset-d2-business', title: '葡萄酒商業與行銷', certLabel: 'WSET D2' },
  { courseId: 'wset-d3-world', title: '世界葡萄酒深度', certLabel: 'WSET D3' },
  { courseId: 'wset-d4-sparkling-pro', title: '氣泡酒專業', certLabel: 'WSET D4' },
  { courseId: 'somm-exam-prep', title: '認證考試準備總覽', certLabel: 'WSET/CMS/MW' },
]

/** CMS 認證路徑：入門侍酒師 → 演繹品飲 → 服務實務 → Advanced */
const CMS_PLAN: PlanStep[] = [
  { courseId: 'wine-basics', title: '葡萄酒入門', certLabel: 'WSET' },
  { courseId: 'cms-intro-somm', title: 'CMS 入門侍酒師', certLabel: 'CMS' },
  { courseId: 'wset-l3-tasting', title: '系統化品飲分析', certLabel: 'WSET L3/CMS' },
  { courseId: 'cms-deductive-tasting', title: 'CMS 演繹品飲法', certLabel: 'CMS' },
  { courseId: 'cms-service', title: '侍酒服務實務', certLabel: 'CMS' },
  { courseId: 'cms-advanced-regions', title: '侍酒師產區與品種', certLabel: 'CMS Adv' },
  { courseId: 'blind-tasting-advanced', title: '盲品實戰進階', certLabel: 'CMS' },
  { courseId: 'somm-exam-prep', title: '認證考試準備總覽', certLabel: 'WSET/CMS/MW' },
]

/** MW 認證路徑：栽培 → 釀造 → 商業 */
const MW_PLAN: PlanStep[] = [
  { courseId: 'wine-basics', title: '葡萄酒入門', certLabel: 'WSET' },
  { courseId: 'wset-l3-viticulture', title: '葡萄栽培與風土', certLabel: 'WSET L3/MW' },
  { courseId: 'mw-viticulture', title: 'MW 葡萄栽培深度', certLabel: 'MW' },
  { courseId: 'wset-l3-tasting', title: '系統化品飲分析', certLabel: 'WSET L3' },
  { courseId: 'mw-vinification', title: 'MW 釀造與裝瓶前', certLabel: 'MW' },
  { courseId: 'mw-business', title: 'MW 葡萄酒商業', certLabel: 'MW' },
  { courseId: 'wset-d3-world', title: '世界葡萄酒深度', certLabel: 'WSET D3' },
  { courseId: 'somm-exam-prep', title: '認證考試準備總覽', certLabel: 'WSET/CMS/MW' },
]

/**
 * 依目標取得個人化學習計劃（建議課程順序）
 */
export function getPlanByGoal(goal: PlanGoal): PlanStep[] {
  switch (goal) {
    case 'WSET':
      return [...WSET_PLAN]
    case 'CMS':
      return [...CMS_PLAN]
    case 'MW':
      return [...MW_PLAN]
    default:
      return []
  }
}

export const PLAN_GOAL_LABELS: Record<PlanGoal, string> = {
  WSET: 'WSET 認證（葡萄酒與烈酒教育）',
  CMS: 'CMS 認證（侍酒師大師公會）',
  MW: 'MW 認證（葡萄酒大師）',
}
