'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Wine,
  Moon,
  Heart,
  Flame,
  Droplets,
  Wind,
  Mountain,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Share2,
  Zap,
  Star,
  Coffee,
  Sun,
  History,
  BookOpen,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { TOAST_COPY_SUCCESS, TOAST_COPY_ERROR } from '@/config/toast.config'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { useTranslation } from '@/contexts/I18nContext'
import {
  QUIZ_INTRO,
  QUIZ_STORAGE_KEY,
  QUIZ_LAST_RESULT_KEY,
  QUIZ_HISTORY_KEY,
  QUIZ_HISTORY_MAX,
} from '@/config/quiz.config'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fireFullscreenConfetti } from '@/lib/celebration'

/** Quiz 頁 20 項優化 #17：分享用 base URL，SSR 安全 */
function getShareBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'
}

// 星座資料 - Using Icons instead of Emojis
const zodiacSigns = [
  { id: 'aries', name: '牡羊座', element: 'fire', dates: '3/21-4/19', icon: Flame },
  { id: 'taurus', name: '金牛座', element: 'earth', dates: '4/20-5/20', icon: Mountain },
  { id: 'gemini', name: '雙子座', element: 'air', dates: '5/21-6/20', icon: Wind },
  { id: 'cancer', name: '巨蟹座', element: 'water', dates: '6/21-7/22', icon: Droplets },
  { id: 'leo', name: '獅子座', element: 'fire', dates: '7/23-8/22', icon: Sun },
  { id: 'virgo', name: '處女座', element: 'earth', dates: '8/23-9/22', icon: Mountain },
  { id: 'libra', name: '天秤座', element: 'air', dates: '9/23-10/22', icon: Wind },
  { id: 'scorpio', name: '天蠍座', element: 'water', dates: '10/23-11/21', icon: Moon },
  { id: 'sagittarius', name: '射手座', element: 'fire', dates: '11/22-12/21', icon: Flame },
  { id: 'capricorn', name: '摩羯座', element: 'earth', dates: '12/22-1/19', icon: Mountain },
  { id: 'aquarius', name: '水瓶座', element: 'air', dates: '1/20-2/18', icon: Wind },
  { id: 'pisces', name: '雙魚座', element: 'water', dates: '2/19-3/20', icon: Droplets },
]

/** 59 星座元素特質簡述 */
const ELEMENT_TRAITS: Record<string, string> = {
  fire: '火象：熱情、主動',
  earth: '土象：穩重、務實',
  air: '風象：靈活、善變',
  water: '水象：感性、直覺',
}

/** 58 依生日推算星座 id（月/日）；從區間起點由晚到早檢查，第一個 (month,day) >= (m,d) 即該星座 */
function getZodiacIdFromDate(month: number, day: number): string {
  const limits: [number, number, string][] = [
    [1, 20, 'aquarius'], [2, 19, 'pisces'], [3, 21, 'aries'], [4, 20, 'taurus'], [5, 21, 'gemini'],
    [6, 21, 'cancer'], [7, 23, 'leo'], [8, 23, 'virgo'], [9, 23, 'libra'], [10, 23, 'scorpio'],
    [11, 22, 'sagittarius'], [12, 22, 'capricorn'], [1, 1, 'capricorn'],
  ]
  for (let i = limits.length - 1; i >= 0; i--) {
    const [m, d, id] = limits[i]
    if (month > m || (month === m && day >= d)) return id
  }
  return 'capricorn'
}

/** 64 隨機打亂陣列（Fisher-Yates） */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 67 口味特徵雷達圖：N 個特質等角分布於圓上，等半徑多邊形 */
function TraitRadarChart({ traits }: { traits: string[] }) {
  const n = Math.max(3, Math.min(6, traits.length))
  const r = 48
  const cx = 56
  const cy = 56
  const points: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 360 / n - 90) * (Math.PI / 180)
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  const polygonPoints = points.map(([x, y]) => `${x},${y}`).join(' ')
  const labelR = r + 18
  return (
    <div className="relative inline-block" role="img" aria-label={`特質雷達：${traits.join('、')}`}>
      <svg width={112} height={112} viewBox="0 0 112 112" className="text-primary-500/80" aria-hidden>
        <polygon
          points={polygonPoints}
          fill="rgba(139,0,0,0.15)"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary-400"
        />
        {traits.slice(0, n).map((t, i) => {
          const angle = (i * 360 / n - 90) * (Math.PI / 180)
          const lx = cx + labelR * Math.cos(angle)
          const ly = cy + labelR * Math.sin(angle)
          return (
            <text
              key={t}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white/70 text-[10px] font-medium"
            >
              {t}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

/** 61-62 性格問題：18 題、口語化有趣；64 隨機順序 */
const questions = [
  { id: 1, question: '週末夜晚，你的理想安排是？', options: [{ id: 'a', text: '私人派對狂歡', icon: Zap, trait: 'extrovert' }, { id: 'b', text: '獨處品酩時光', icon: Coffee, trait: 'introvert' }, { id: 'c', text: '探索全新餐廳', icon: Star, trait: 'adventurous' }, { id: 'd', text: '家中閱讀沉思', icon: Moon, trait: 'calm' }] },
  { id: 2, question: '你追求的風味比較像？', options: [{ id: 'a', text: '濃郁有衝擊力', icon: Flame, trait: 'bold' }, { id: 'b', text: '清爽優雅', icon: Wind, trait: 'light' }, { id: 'c', text: '甜美圓潤', icon: Heart, trait: 'sweet' }, { id: 'd', text: '酸度分明', icon: Droplets, trait: 'balanced' }] },
  { id: 3, question: '面對未知挑戰，你通常？', options: [{ id: 'a', text: '先衝再說', icon: Zap, trait: 'bold' }, { id: 'b', text: '先評估風險', icon: Moon, trait: 'cautious' }, { id: 'c', text: '找夥伴一起', icon: Heart, trait: 'social' }, { id: 'd', text: '先擬計畫', icon: Star, trait: 'organized' }] },
  { id: 4, question: '朋友形容你比較像？', options: [{ id: 'a', text: '人群中的焦點', icon: Zap, trait: 'extrovert' }, { id: 'b', text: '安靜但有想法', icon: Coffee, trait: 'introvert' }, { id: 'c', text: '愛嘗鮮', icon: Star, trait: 'adventurous' }, { id: 'd', text: '穩重可靠', icon: Mountain, trait: 'calm' }] },
  { id: 5, question: '選酒時你更在意？', options: [{ id: 'a', text: '夠濃夠有存在感', icon: Flame, trait: 'bold' }, { id: 'b', text: '順口好入喉', icon: Wind, trait: 'light' }, { id: 'c', text: '香氣層次', icon: Heart, trait: 'sweet' }, { id: 'd', text: '產區與故事', icon: Star, trait: 'organized' }] },
  { id: 6, question: '約會選餐廳，你會？', options: [{ id: 'a', text: '選最嗨的', icon: Zap, trait: 'extrovert' }, { id: 'b', text: '選安靜好聊的', icon: Moon, trait: 'introvert' }, { id: 'c', text: '試沒去過的', icon: Star, trait: 'adventurous' }, { id: 'd', text: '先查評價', icon: Mountain, trait: 'cautious' }] },
  { id: 7, question: '喝到不喜歡的酒，你會？', options: [{ id: 'a', text: '直說不喜歡', icon: Flame, trait: 'bold' }, { id: 'b', text: '默默喝完', icon: Moon, trait: 'calm' }, { id: 'c', text: '問別人覺得怎樣', icon: Heart, trait: 'social' }, { id: 'd', text: '記下來下次避開', icon: Star, trait: 'organized' }] },
  { id: 8, question: '你的「放鬆模式」比較像？', options: [{ id: 'a', text: '跟一群人嗨', icon: Zap, trait: 'extrovert' }, { id: 'b', text: '一個人追劇', icon: Coffee, trait: 'introvert' }, { id: 'c', text: '出門探險', icon: Star, trait: 'adventurous' }, { id: 'd', text: '泡澡或運動', icon: Droplets, trait: 'balanced' }] },
  { id: 9, question: '第一次喝到超對味的酒，你會？', options: [{ id: 'a', text: '立刻再點一瓶', icon: Flame, trait: 'bold' }, { id: 'b', text: '細細記住味道', icon: Moon, trait: 'light' }, { id: 'c', text: '拍照分享', icon: Heart, trait: 'social' }, { id: 'd', text: '查產區品種', icon: Star, trait: 'organized' }] },
  { id: 10, question: '別人找你訴苦，你通常？', options: [{ id: 'a', text: '直接給建議', icon: Zap, trait: 'bold' }, { id: 'b', text: '先靜靜聽', icon: Moon, trait: 'calm' }, { id: 'c', text: '陪他一起罵', icon: Heart, trait: 'social' }, { id: 'd', text: '幫他分析選項', icon: Star, trait: 'organized' }] },
  { id: 11, question: '你偏好的「甜度」？', options: [{ id: 'a', text: '越甜越爽', icon: Heart, trait: 'sweet' }, { id: 'b', text: '微甜或乾型', icon: Wind, trait: 'light' }, { id: 'c', text: '不甜才高級', icon: Star, trait: 'balanced' }, { id: 'd', text: '看場合', icon: Droplets, trait: 'balanced' }] },
  { id: 12, question: '做決定時你比較？', options: [{ id: 'a', text: '憑感覺', icon: Zap, trait: 'bold' }, { id: 'b', text: '想很久', icon: Moon, trait: 'cautious' }, { id: 'c', text: '問朋友', icon: Heart, trait: 'social' }, { id: 'd', text: '列優缺點', icon: Star, trait: 'organized' }] },
  { id: 13, question: '派對上你通常是？', options: [{ id: 'a', text: '帶動氣氛', icon: Zap, trait: 'extrovert' }, { id: 'b', text: '角落觀察', icon: Coffee, trait: 'introvert' }, { id: 'c', text: '到處聊天', icon: Heart, trait: 'social' }, { id: 'd', text: '幫忙張羅', icon: Mountain, trait: 'organized' }] },
  { id: 14, question: '你對「單寧」的接受度？', options: [{ id: 'a', text: '越咬越過癮', icon: Flame, trait: 'bold' }, { id: 'b', text: '不要太澀', icon: Wind, trait: 'light' }, { id: 'c', text: '可以接受', icon: Droplets, trait: 'balanced' }, { id: 'd', text: '不太懂但想學', icon: Star, trait: 'adventurous' }] },
  { id: 15, question: '旅行時你偏好？', options: [{ id: 'a', text: '行程滿檔', icon: Zap, trait: 'bold' }, { id: 'b', text: '放空發呆', icon: Moon, trait: 'calm' }, { id: 'c', text: '亂走探險', icon: Star, trait: 'adventurous' }, { id: 'd', text: '按表操課', icon: Mountain, trait: 'organized' }] },
  { id: 16, question: '你覺得自己比較像？', options: [{ id: 'a', text: '烈酒：直接有勁', icon: Flame, trait: 'bold' }, { id: 'b', text: '白酒：清爽好親近', icon: Wind, trait: 'light' }, { id: 'c', text: '粉紅酒：浪漫好相處', icon: Heart, trait: 'sweet' }, { id: 'd', text: '紅酒：有層次耐品', icon: Droplets, trait: 'balanced' }] },
  { id: 17, question: '被誇獎時你通常？', options: [{ id: 'a', text: '大方接受', icon: Zap, trait: 'extrovert' }, { id: 'b', text: '有點不好意思', icon: Moon, trait: 'introvert' }, { id: 'c', text: '反誇對方', icon: Heart, trait: 'social' }, { id: 'd', text: '覺得還有進步空間', icon: Star, trait: 'organized' }] },
  { id: 18, question: '選「靈魂酒款」你希望？', options: [{ id: 'a', text: '一喝就難忘', icon: Flame, trait: 'bold' }, { id: 'b', text: '日常好搭', icon: Wind, trait: 'light' }, { id: 'c', text: '有故事可講', icon: Heart, trait: 'sweet' }, { id: 'd', text: '專業有深度', icon: Star, trait: 'organized' }] },
]

/** T030 P1：測驗結果結構化 — name、type、shortReason 一致顯示 */
const wineResults: Record<string, {
  name: string
  type: string
  shortReason: string
  description: string
  pairing: string[]
  icon: LucideIcon
  traits: string[]
  quote: string
}> = {
  'fire-bold': {
    name: 'Cabernet Sauvignon',
    type: '霸氣領袖',
    shortReason: '濃郁單寧與深沉果香，完美呼應您的領袖氣質。',
    description: '如同烈火般熱情奔放，您需要一款充滿力量的酒。Cabernet Sauvignon 的濃郁單寧與深沉果香，完美呼應您的領袖氣質。',
    pairing: ['肋眼牛排', '陳年切達', '黑松露'],
    icon: Flame,
    traits: ['自信', '熱情', '強勢'],
    quote: 'Boldness is not a choice, it is a lifestyle.'
  },
  'fire-light': {
    name: 'Provence Rosé',
    type: '活力靈魂',
    shortReason: '清新果香與礦物感，呼應您游刃有餘的社交魅力。',
    description: '您的熱情中帶著一絲輕盈與優雅。粉紅酒的清新果香與礦物感，如同您在社交場合中游刃有餘的魅力。',
    pairing: ['地中海沙拉', '鮮蝦', '輕乳酪'],
    icon: Sun,
    traits: ['活力', '樂觀', '迷人'],
    quote: 'Life looks better through rose-tinted glasses.'
  },
  'earth-bold': {
    name: 'Barolo',
    type: '王者之風',
    shortReason: '時間淬鍊的酒中之王，滿足您對品質的極致苛求。',
    description: '穩重、踏實、追求深度。只有像 Barolo 這樣需要時間淬鍊的酒中之王，才能滿足您對品質的極致苛求。',
    pairing: ['燉牛肉', '野味', '帕瑪森'],
    icon: Mountain,
    traits: ['成熟', '穩重', '深刻'],
    quote: 'True quality stands the test of time.'
  },
  'earth-light': {
    name: 'Pinot Noir',
    type: '優雅思想家',
    shortReason: '絲滑口感與複雜層次，呼應您內斂而富有深度的靈魂。',
    description: '務實中帶著細膩的感性，Pinot Noir 的絲滑口感與複雜層次，正如您內斂而富有深度的靈魂。',
    pairing: ['烤鴨胸', '野菇燉飯', '布里乳酪'],
    icon: Moon,
    traits: ['優雅', '細膩', '知性'],
    quote: 'Elegance is the only beauty that never fades.'
  },
  'air-bold': {
    name: 'Prosecco',
    type: '社交光芒',
    shortReason: '歡快氣泡與清新果味，寫照您輕鬆愉悅的人生態度。',
    description: '思維敏捷，是人群中的焦點。Prosecco 的歡快氣泡與清新果味，正是您輕鬆愉悅人生態度的寫照。',
    pairing: ['餐前小點', '日式刺身', '水果塔'],
    icon: Wind,
    traits: ['機智', '社交', '歡愉'],
    quote: 'Sparkle wherever you go.'
  },
  'air-light': {
    name: 'Sauvignon Blanc',
    type: '清醒智者',
    shortReason: '俐落酸度與草本香氣，呼應您清晰而獨特的觀點。',
    description: '聰明理性，追求純粹。Sauvignon Blanc 的俐落酸度與草本香氣，完美呼應您清晰而獨特的觀點。',
    pairing: ['生蠔', '青醬義大利麵', '山羊乳酪'],
    icon: Star,
    traits: ['理性', '清新', '純粹'],
    quote: 'Simplicity is the ultimate sophistication.'
  },
  'water-bold': {
    name: 'Malbec',
    type: '神秘行者',
    shortReason: '深邃色澤與紫羅蘭香氣，如同您內心深處的神秘花園。',
    description: '情感豐富且深沉。Malbec 的深邃色澤與紫羅蘭香氣，如同您內心深處不為人知的神秘花園。',
    pairing: ['炭烤羊排', '黑巧克力', '藍紋乳酪'],
    icon: Droplets,
    traits: ['神秘', '濃烈', '感性'],
    quote: 'Still waters run deep.'
  },
  'water-light': {
    name: 'Riesling',
    type: '浪漫夢想家',
    shortReason: '優雅酸甜與花香，詮釋您浪漫而充滿詩意的靈魂。',
    description: '敏感且富有想像力。Riesling 的優雅酸甜與花香，詮釋了您浪漫而充滿詩意的靈魂。',
    pairing: ['泰式料理', '檸檬塔', '水果沙拉'],
    icon: Heart,
    traits: ['浪漫', '想像', '甜美'],
    quote: 'Dream without fear, love without limits.'
  },
}

/** T031 P1：測驗可選「我不喝酒，只要遊戲」跳過酒推薦 */
type Step = 'intro' | 'preference' | 'zodiac' | 'questions' | 'result'

export default function QuizPage() {
  const { user } = useUser()
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('intro')
  /** T031：選「只要遊戲」時結果為派對遊戲推薦、無酒款 */
  const [preferGamesOnly, setPreferGamesOnly] = useState(false)
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<typeof wineResults[string] | null>(null)
  /** T031：只要遊戲時顯示的推薦遊戲（id, name） */
  const [gamesOnlySuggested, setGamesOnlySuggested] = useState<{ id: string; name: string }[]>([])
  /** 64 隨機問題順序（進入題目時打亂一次） */
  const [shuffledQuestions, setShuffledQuestions] = useState<typeof questions>([])
  /** 58 不知道星座？用生日 */
  const [birthDate, setBirthDate] = useState('')

  const displayQuestions = shuffledQuestions.length > 0 ? shuffledQuestions : questions
  /** 48 焦點管理：step 切換時聚焦主區域 */
  const mainRef = useRef<HTMLDivElement>(null)
  /** 73 上次測驗結果（用於歷史對比） */
  const [lastResult, setLastResult] = useState<{ name: string; type: string } | null>(null)
  /** E2 150：測驗歷史列表；E2 歷史彈窗 */
  const [quizHistory, setQuizHistory] = useState<{ date: string; name: string; type: string }[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  /** Quiz 頁 20 項優化 #5：尊重減少動態。#16：與 #5 一致，關鍵動畫皆尊重 prefersReducedMotion。 */
  const prefersReducedMotion = usePrefersReducedMotion()
  /** Quiz 頁 20 項優化 #18：intro 逾時 — 停留超過 N 分鐘未點開始時顯示輕量提示 */
  const [showIdleHint, setShowIdleHint] = useState(false)
  /** P1-070：問題切換方向 — 下一題向右滑入、上一題向左滑入 */
  const [questionDirection, setQuestionDirection] = useState<'next' | 'prev'>('next')
  /** Quiz 頁 20 項優化 #3 #4：歷史彈窗焦點陷阱與 Esc 關閉用 */
  const historyModalRef = useRef<HTMLDivElement>(null)
  const historyModalCloseButtonRef = useRef<HTMLButtonElement>(null)
  const historyModalPreviouslyFocusedRef = useRef<HTMLElement | null>(null)

  /** Quiz 頁 20 項優化 #10：步驟瀏覽 analytics */
  useEffect(() => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'quiz_step_view', value: 1, id: step }),
      }).catch(() => { })
    } catch { /* noop */ }
  }, [step])

  /** Quiz 頁 20 項優化 #18：intro 逾時 — 停留 5 分鐘未點開始則顯示「是否繼續？」可關閉 */
  const INTRO_IDLE_MINUTES = 5
  useEffect(() => {
    if (step !== 'intro') {
      setShowIdleHint(false)
      return
    }
    const t = setTimeout(() => setShowIdleHint(true), INTRO_IDLE_MINUTES * 60 * 1000)
    return () => clearTimeout(t)
  }, [step])

  /** E2 150：載入測驗歷史 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZ_HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        const arr = Array.isArray(parsed) ? parsed : []
        const items = arr.slice(-QUIZ_HISTORY_MAX).filter(
          (x): x is { date: string; name: string; type: string } =>
            x != null && typeof x === 'object' && 'date' in x && 'name' in x && 'type' in x
        )
        setQuizHistory(items)
      }
    } catch {
      /* ignore */
    }
  }, [])

  /** 55 中途離開時保存進度（含 64 題目順序以便恢復時對應答案）；T031 含 preferGamesOnly */
  useEffect(() => {
    if (step === 'result' || step === 'intro') return
    try {
      const questionOrder = shuffledQuestions.length > 0
        ? shuffledQuestions.map((sq) => questions.findIndex((q) => q.id === sq.id))
        : []
      const payload = { step, currentQuestion, selectedZodiac, answers, questionOrder, preferGamesOnly }
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [step, currentQuestion, selectedZodiac, answers, shuffledQuestions, preferGamesOnly])

  /** 55 進入頁面時恢復進度 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZ_STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as {
        step?: string
        currentQuestion?: number
        selectedZodiac?: string | null
        answers?: Record<number, string>
        questionOrder?: number[]
      }
      if (data.step && data.step !== 'result' && data.step !== 'intro') {
        if (data.step === 'preference') {
          setStep('preference')
        } else if (data.step === 'zodiac') {
          setStep('zodiac')
          if (typeof (data as { preferGamesOnly?: boolean }).preferGamesOnly === 'boolean') {
            setPreferGamesOnly((data as { preferGamesOnly?: boolean }).preferGamesOnly!)
          }
        } else if (data.step === 'questions' && typeof data.currentQuestion === 'number' && data.selectedZodiac) {
          setStep('questions')
          setSelectedZodiac(data.selectedZodiac)
          if (Array.isArray(data.questionOrder) && data.questionOrder.length === questions.length) {
            setShuffledQuestions(data.questionOrder.map((i) => questions[i]))
          } else {
            setShuffledQuestions(questions)
          }
          setCurrentQuestion(Math.min(data.currentQuestion, questions.length - 1))
          setAnswers(data.answers ?? {})
          const pg = (data as { preferGamesOnly?: boolean }).preferGamesOnly
          if (typeof pg === 'boolean') {
            setPreferGamesOnly(pg)
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  const handleStart = () => {
    setStep('preference')
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  /** T031：選擇「酒款推薦」或「只要遊戲」後進入星座 */
  const handlePreference = (gamesOnly: boolean) => {
    setPreferGamesOnly(gamesOnly)
    setStep('zodiac')
  }

  const handleZodiacSelect = (zodiacId: string) => {
    setSelectedZodiac(zodiacId)
    setShuffledQuestions(shuffle([...questions]))
    setStep('questions')
  }

  /** 58 不知道星座？依生日選擇 */
  const handleBirthDateSelect = () => {
    if (!birthDate.trim()) return
    const [y, m, d] = birthDate.split('-').map(Number)
    const zodiacId = getZodiacIdFromDate(m, d)
    setSelectedZodiac(zodiacId)
    setShuffledQuestions(shuffle([...questions]))
    setStep('questions')
  }

  const handleAnswer = (optionId: string, trait: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: trait }))
    if (currentQuestion < displayQuestions.length - 1) {
      setQuestionDirection('next')
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300)
    } else {
      calculateResult(trait)
    }
  }

  /** E57：分享送 analytics */
  const handleShareResult = (r: typeof wineResults[string]) => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'quiz_share', value: 1, id: 'result' }),
      }).catch(() => { })
    } catch { /* noop */ }
    const text = t('quiz.shareText').replace(/\{\{\s*name\s*\}\}/g, r.name).replace(/\{\{\s*type\s*\}\}/g, r.type)
    const url = getShareBaseUrl() + '/quiz'
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: '靈魂酒測結果',
        text,
        url,
      }).catch(() => {
        copyShareText(text, url)
      })
    } else {
      copyShareText(text, url)
    }
  }

  /** Quiz 頁 20 項優化 #6：複製成功顯示 Toast */
  const copyShareText = (text: string, url: string) => {
    try {
      navigator.clipboard.writeText(`${text}\n${url}`)
      toast.success(TOAST_COPY_SUCCESS)
    } catch {
      toast.error(TOAST_COPY_ERROR)
    }
  }

  /** 55 上一題；P1-070：上一題時向左滑入 */
  const handlePrev = () => {
    if (currentQuestion <= 0) return
    setQuestionDirection('prev')
    const next = currentQuestion - 1
    setCurrentQuestion(next)
    setAnswers(prev => {
      const nextAnswers = { ...prev }
      delete nextAnswers[currentQuestion]
      return nextAnswers
    })
  }

  /** T031：依測驗特質動態推薦遊戲 — 特質群對應遊戲池，取 5 款 */
  const GAMES_POOL_BY_TRAIT: Record<string, { id: string; name: string }[]> = {
    party: [
      { id: 'truth-or-dare', name: '真心話大冒險' },
      { id: 'kings-cup', name: '國王遊戲' },
      { id: 'never-have-i-ever', name: '我從來沒有' },
      { id: 'would-you-rather', name: '終極二選一' },
      { id: 'who-most-likely', name: '誰最可能' },
      { id: 'secret-reveal', name: '秘密爆料' },
    ],
    calm: [
      { id: 'roulette', name: '命運轉盤' },
      { id: 'dice', name: '深空骰子' },
      { id: 'random-picker', name: '隨機選一位' },
      { id: 'countdown-toast', name: '倒數乾杯' },
      { id: 'would-you-rather', name: '終極二選一' },
      { id: 'coin-flip', name: '拋硬幣' },
    ],
    adventurous: [
      { id: 'who-is-undercover', name: '誰是臥底' },
      { id: 'werewolf-lite', name: '狼人殺簡化版' },
      { id: 'story-chain', name: '故事接龍' },
      { id: 'chemistry-test', name: '默契大考驗' },
      { id: 'charades', name: '比手畫腳' },
    ],
    organized: [
      { id: 'trivia', name: '酒神隨堂考' },
      { id: 'baskin-robbins-31', name: '31 遊戲' },
      { id: 'up-down-stairs', name: '上下樓梯' },
      { id: 'high-low', name: '比大小' },
    ],
  }
  const DEFAULT_GAMES_POOL: { id: string; name: string }[] = [
    { id: 'truth-or-dare', name: '真心話大冒險' },
    { id: 'roulette', name: '命運轉盤' },
    { id: 'never-have-i-ever', name: '我從來沒有' },
    { id: 'kings-cup', name: '國王遊戲' },
    { id: 'would-you-rather', name: '終極二選一' },
  ]

  function getSuggestedGamesByTraits(allTraits: string[]): { id: string; name: string }[] {
    const count: Record<string, number> = {}
    allTraits.forEach(t => { count[t] = (count[t] || 0) + 1 })
    const partyTraits = ['extrovert', 'social', 'bold']
    const calmTraits = ['introvert', 'calm', 'cautious', 'light']
    const adventurousTraits = ['adventurous']
    const organizedTraits = ['organized']
    const score = (keys: string[]) => keys.reduce((s, k) => s + (count[k] || 0), 0)
    const scores = [
      { key: 'party', score: score(partyTraits), pool: GAMES_POOL_BY_TRAIT.party },
      { key: 'calm', score: score(calmTraits), pool: GAMES_POOL_BY_TRAIT.calm },
      { key: 'adventurous', score: score(adventurousTraits), pool: GAMES_POOL_BY_TRAIT.adventurous },
      { key: 'organized', score: score(organizedTraits), pool: GAMES_POOL_BY_TRAIT.organized },
    ].filter(s => s.score > 0)
    scores.sort((a, b) => b.score - a.score)
    const picked = new Set<string>()
    const out: { id: string; name: string }[] = []
    for (const { pool } of scores) {
      const shuffled = shuffle([...pool])
      for (const g of shuffled) {
        if (out.length >= 5) break
        if (!picked.has(g.id)) { picked.add(g.id); out.push(g) }
      }
    }
    while (out.length < 5) {
      const fallback = DEFAULT_GAMES_POOL.find(g => !picked.has(g.id))
      if (!fallback) break
      picked.add(fallback.id)
      out.push(fallback)
    }
    return out.slice(0, 5)
  }

  const calculateResult = (lastTrait: string) => {
    if (preferGamesOnly) {
      const allTraits = [...Object.values(answers), lastTrait]
      setGamesOnlySuggested(getSuggestedGamesByTraits(allTraits))
      setResult(null)
      setStep('result')
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'quiz_complete', value: 1, id: user ? 'logged_in' : 'anonymous' }),
        }).catch(() => { })
      } catch { /* noop */ }
      try {
        localStorage.removeItem(QUIZ_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      if (!prefersReducedMotion) {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 }, colors: ['#8A2BE2', '#D4AF37'] })
      }
      return
    }

    const allTraits = { ...answers, [currentQuestion]: lastTrait }
    const traitCounts: Record<string, number> = {}
    Object.values(allTraits).forEach(trait => traitCounts[trait] = (traitCounts[trait] || 0) + 1)

    const zodiac = zodiacSigns.find(z => z.id === selectedZodiac)
    const element = zodiac?.element || 'fire'

    const boldTraits = ['extrovert', 'adventurous', 'bold', 'confident', 'social']
    const lightTraits = ['introvert', 'calm', 'cautious', 'gentle', 'organized']
    let boldScore = 0
    let lightScore = 0
    Object.entries(traitCounts).forEach(([trait, count]) => {
      if (boldTraits.includes(trait)) boldScore += count
      if (lightTraits.includes(trait)) lightScore += count
    })

    const intensity = boldScore >= lightScore ? 'bold' : 'light'
    const resultKey = `${element}-${intensity}`

    const newResult = wineResults[resultKey] || wineResults['fire-bold']
    try {
      const raw = localStorage.getItem(QUIZ_LAST_RESULT_KEY)
      if (raw) {
        const prev = JSON.parse(raw) as { name: string; type: string }
        setLastResult(prev)
      } else {
        setLastResult(null)
      }
      localStorage.setItem(QUIZ_LAST_RESULT_KEY, JSON.stringify({ name: newResult.name, type: newResult.type }))
    } catch {
      setLastResult(null)
    }
    setResult(newResult)
    setStep('result')
    /** P1-070：結果頁慶祝動畫 — 全螢幕彩帶；尊重 prefers-reduced-motion */
    if (!prefersReducedMotion) fireFullscreenConfetti()
    /** T035 P2：追蹤測驗完成未登入比例，供 A/B 結果頁登入 CTA 優化 */
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'quiz_complete', value: 1, id: user ? 'logged_in' : 'anonymous' }),
      }).catch(() => { })
    } catch { /* noop */ }
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY)
      /** E2 150：寫入測驗歷史 */
      const raw = localStorage.getItem(QUIZ_HISTORY_KEY)
      const prev = raw ? (JSON.parse(raw) as { date: string; name: string; type: string }[]) : []
      const next = [...prev, { date: new Date().toISOString(), name: newResult.name, type: newResult.type }].slice(-QUIZ_HISTORY_MAX)
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next))
      setQuizHistory(next)
    } catch {
      /* ignore */
    }
    if (!prefersReducedMotion) {
      // Phase 1 B2.3: 增強 confetti 效果 - 多階段爆發
      const colors = ['#8B0000', '#D4AF37', '#8A2BE2', '#FFFFFF']
      // 第一波：左右射擊
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 }, angle: 60, colors })
      }, 0)
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 }, angle: 120, colors })
      }, 100)
      // 第二波：中央大爆發
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 120, origin: { x: 0.5, y: 0.6 }, colors, scalar: 1.2 })
      }, 250)
      // 第三波：金色星星
      setTimeout(() => {
        confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 }, colors: ['#D4AF37', '#FFD700'], shapes: ['star'] })
      }, 400)
    }
  }

  /** E57：再測一次送 analytics */
  const handleReset = () => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'quiz_retake', value: 1, id: 'result' }),
      }).catch(() => { })
    } catch { /* noop */ }
    setStep('intro')
    setPreferGamesOnly(false)
    setGamesOnlySuggested([])
    setSelectedZodiac(null)
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  /** 48 焦點管理：step 切換時聚焦主區域，利於鍵盤與螢幕閱讀器 */
  useEffect(() => {
    if ((step === 'questions' || step === 'result') && mainRef.current) {
      mainRef.current.focus({ preventScroll: true })
    }
  }, [step])

  /** Quiz 頁 20 項優化 #3 #4：歷史彈窗開啟時焦點陷阱、Esc 關閉 */
  useEffect(() => {
    if (!showHistoryModal) return
    historyModalPreviouslyFocusedRef.current = document.activeElement as HTMLElement | null
    const closeBtn = historyModalCloseButtonRef.current
    if (closeBtn) {
      requestAnimationFrame(() => closeBtn.focus())
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowHistoryModal(false)
        historyModalPreviouslyFocusedRef.current?.focus()
      }
      if (e.key !== 'Tab') return
      const el = historyModalRef.current
      if (!el) return
      const focusables = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const list = Array.from(focusables)
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      historyModalPreviouslyFocusedRef.current?.focus()
    }
  }, [showHistoryModal])

  /** 29 鍵盤導覽：題目頁 ←/→ 上下題，1-4 選選項 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (step !== 'questions') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (currentQuestion > 0) {
          setCurrentQuestion((c) => c - 1)
          setAnswers((prev) => {
            const next = { ...prev }
            delete next[currentQuestion]
            return next
          })
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const ans = answers[currentQuestion]
        if (currentQuestion < displayQuestions.length - 1 && ans) {
          const opt = displayQuestions[currentQuestion].options.find((o) => o.trait === ans)
          if (opt) handleAnswer(opt.id, opt.trait)
        }
      } else if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1
        const opts = displayQuestions[currentQuestion].options
        if (idx < opts.length) {
          e.preventDefault()
          handleAnswer(opts[idx].id, opts[idx].trait)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleAnswer intentionally omitted to avoid re-run on every answer
  }, [step, currentQuestion, displayQuestions, answers])

  /** AUDIT #34：Intro 與結果頁背景與首頁 Hero 漸層呼應 */
  const isIntroOrResult = step === 'intro' || (step === 'result' && !!result)

  /** Quiz 頁 20 項優化 #8：RWD — 360px～1920px 無橫向捲動、safe-area 一致 */
  return (
    <div ref={mainRef} className={`min-h-screen pt-0 page-container-mobile px-4 md:px-6 md:py-8 safe-area-px safe-area-pb-quiz-main overflow-x-hidden ${isIntroOrResult ? 'quiz-hero-echo' : ''}`} id="quiz-main" tabIndex={-1} role="main" aria-label="靈魂酒測">
      <div className="max-w-5xl xl:max-w-[1440px] mx-auto">
        <AnimatePresence mode="wait">

          {/* Intro Step；Quiz 頁 20 項優化 #1：首屏關鍵區，intro 保持輕量不阻塞 CTA */}
          {step === 'intro' && (
            <m.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center pt-0 pb-12"
            >
              {showIdleHint && (
                <div className="mb-4 mx-auto max-w-md flex items-center justify-between gap-3 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-left" role="status">
                  <p className="text-white/90 text-sm">是否繼續？點下方按鈕開始靈魂酒測。</p>
                  <button type="button" onClick={() => setShowIdleHint(false)} className="shrink-0 text-white/60 hover:text-white text-sm font-medium games-focus-ring" aria-label="關閉提示">關閉</button>
                </div>
              )}
              <div className="flex justify-center mb-4">
                <FeatureIcon icon={Sparkles} size="lg" color="secondary" />
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
                {QUIZ_INTRO.title.split(QUIZ_INTRO.titleHighlight)[0]}
                <span className="gradient-text">{QUIZ_INTRO.titleHighlight}</span>
              </h1>
              <p className="text-white/50 text-xl mb-2 max-w-lg mx-auto leading-relaxed">
                {QUIZ_INTRO.subtitle}
              </p>
              <p className="text-white/40 text-sm mb-6" aria-hidden>{QUIZ_INTRO.timeNote}</p>
              <p className="text-white/40 text-xs mb-4" aria-hidden>{QUIZ_INTRO.disclaimer}</p>

              <button
                className="btn-primary min-h-[48px] text-xl px-12 py-5 shadow-glow-primary games-focus-ring"
                onClick={handleStart}
                aria-label={QUIZ_INTRO.ctaAriaLabel}
              >
                {QUIZ_INTRO.ctaLabel}
              </button>
              {/* P0：次要行動分離 — 查看測驗歷史不搶主 CTA 視覺 */}
              {quizHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(true)}
                    className="btn-ghost text-white/50 hover:text-white text-sm font-medium transition-colors games-focus-ring"
                    aria-label="查看測驗歷史"
                  >
                    查看測驗歷史（{quizHistory.length} 筆）
                  </button>
                </div>
              )}
            </m.div>
          )}

          {/* T031 P1：你這次想要？酒款推薦（含遊戲）｜只要派對遊戲推薦（不喝酒） */}
          {step === 'preference' && (
            <m.div
              key="preference"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center pt-0 pb-12"
            >
              <div className="flex justify-center mb-4">
                <FeatureIcon icon={Sparkles} size="lg" color="accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                你這次想要？
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
                可以選酒款推薦，或只要派對遊戲推薦（不喝酒也能玩）。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => handlePreference(false)}
                  className="glass-card p-6 text-left hover:bg-white/10 border border-white/10 rounded-2xl min-h-[48px] transition-colors games-focus-ring"
                  aria-label="酒款推薦（含遊戲）"
                >
                  <div className="flex items-center gap-3">
                    <Wine className="w-8 h-8 text-primary-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white block">酒款推薦（含遊戲）</span>
                      <span className="text-white/50 text-sm">測出靈魂之酒＋派對遊戲</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreference(true)}
                  className="glass-card p-6 text-left hover:bg-white/10 border border-white/10 rounded-2xl min-h-[48px] transition-colors games-focus-ring"
                  aria-label="只要派對遊戲推薦（不喝酒）"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-accent-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white block">只要派對遊戲推薦</span>
                      <span className="text-white/50 text-sm">不喝酒也能玩，直接推薦遊戲</span>
                    </div>
                  </div>
                </button>
              </div>
            </m.div>
          )}

          {/* Zodiac Selection 56-60：懸停日期、特質描述、星空背景、58 生日選擇 */}
          {step === 'zodiac' && (
            <m.div
              key="zodiac"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* 60 星座背景星空動態；#19 列印隱藏 */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl print:hidden" aria-hidden>
                <div className="absolute inset-0 opacity-30">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white animate-pulse"
                      style={{
                        left: `${(i * 7) % 100}%`,
                        top: `${(i * 11) % 100}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Quiz 頁 20 項優化 #15：星座區 aria-describedby */}
              <div className="text-center mb-8 relative z-10" id="quiz-zodiac-section">
                <h2 className="text-4xl font-display font-bold text-white mb-4" aria-describedby="quiz-zodiac-desc">
                  選擇您的星座
                </h2>
                <p id="quiz-zodiac-desc" className="text-white/40 text-sm mb-4">依星座元素會影響推薦酒款</p>
                <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
                {zodiacSigns.map((zodiac, index) => (
                  <m.button
                    key={zodiac.id}
                    className="glass-card p-6 flex flex-col items-center justify-center gap-4 group hover:bg-white/10 min-h-[48px] games-focus-ring"
                    onClick={() => handleZodiacSelect(zodiac.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={`${zodiac.name} ${zodiac.dates}`}
                    aria-label={`選擇 ${zodiac.name}`}
                  >
                    <FeatureIcon icon={zodiac.icon} size="sm" color={zodiac.element === 'fire' ? 'primary' : zodiac.element === 'water' ? 'accent' : 'secondary'} />
                    <div className="text-center">
                      <div className="font-semibold text-white group-hover:text-primary-400 transition-colors">{zodiac.name}</div>
                      <div className="text-xs text-white/30 mt-1">{zodiac.dates}</div>
                      <div className="text-[10px] text-white/25 mt-1 group-hover:text-white/40">{ELEMENT_TRAITS[zodiac.element]}</div>
                    </div>
                  </m.button>
                ))}
              </div>

              {/* 58 不知道星座？輸入生日；47 表單 label 關聯 */}
              <div className="mt-8 relative z-10 text-center">
                <label id="quiz-birth-label" htmlFor="quiz-birth-date" className="block text-white/40 text-sm mb-2">
                  不知道星座？
                </label>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <input
                    id="quiz-birth-date"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="input-glass rounded-xl px-4 py-2 text-white/90 text-sm max-w-[200px] min-h-[48px]"
                    aria-labelledby="quiz-birth-label"
                  />
                  <button
                    type="button"
                    onClick={handleBirthDateSelect}
                    disabled={!birthDate.trim()}
                    className="btn-secondary text-sm px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px]"
                    aria-label="依生日推算星座"
                  >
                    依生日推算
                  </button>
                </div>
              </div>
            </m.div>
          )}

          {/* E06 / Questions 51-55：進度條固定頂部、題數與「約 30 秒」一致、再一題就完成、結果頁「查看推薦」第一 CTA */}
          {step === 'questions' && (
            <m.div
              key={`question-${currentQuestion}`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: questionDirection === 'next' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: questionDirection === 'next' ? -100 : 100 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="max-w-3xl mx-auto"
            >
              {/* 51 進度條：sticky 固定頂部；#19 列印隱藏 */}
              <div className="sticky top-0 z-30 -mx-4 px-4 py-3 mb-6 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 print:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary-500 font-mono text-sm tracking-widest uppercase">
                    <span className="tabular-nums">{t('common.questionProgress', { current: currentQuestion + 1, total: displayQuestions.length })}</span>
                  </span>
                  {currentQuestion > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center justify-center gap-1 text-white/50 hover:text-white text-sm font-medium transition-colors min-h-[48px] min-w-[48px] games-focus-ring rounded"
                      aria-label="上一題"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一題
                    </button>
                  )}
                </div>
                {/* Quiz 頁 20 項優化 #13：進度條 aria-valuetext；#19 列印隱藏 */}
                {/* Phase 1 C1.2: 測驗進度條動畫增強 */}
                <div className="h-1.5 md:h-2 w-full rounded-full bg-white/10 overflow-hidden min-h-[4px] print:hidden" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin={1} aria-valuemax={displayQuestions.length} aria-valuetext={t('common.questionProgress', { current: currentQuestion + 1, total: displayQuestions.length })} aria-label={t('common.questionProgress', { current: currentQuestion + 1, total: displayQuestions.length })}>
                  <m.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 relative"
                    initial={false}
                    animate={{ width: `${((currentQuestion + 1) / displayQuestions.length) * 100}%` }}
                    transition={{
                      duration: 0.4,
                      ease: [0.34, 1.56, 0.64, 1],
                      type: 'spring',
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    {/* 進度條尾端光暈 */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/50 rounded-r-full" />
                  </m.div>
                </div>
              </div>

              {/* T040 P2：新題出現時 aria-live polite，動態內容可被朗讀 */}
              <div className="mb-12 text-center" aria-live="polite" aria-atomic="true" aria-label={t('common.questionProgress', { current: currentQuestion + 1, total: displayQuestions.length })}>
                <h2 id="quiz-question-text" className="text-3xl md:text-5xl font-bold text-white">{displayQuestions[currentQuestion].question}</h2>
                {/* T027：最後一題前「再一題就完成」、最後一題「最後一題！」 */}
                <p className="text-white/50 text-sm mt-2" aria-live="polite">
                  {currentQuestion === displayQuestions.length - 1
                    ? '最後一題！'
                    : currentQuestion === displayQuestions.length - 2
                      ? '再一題就完成！'
                      : '依直覺選，不用想太久'}
                </p>
              </div>

              {/* AUDIT #23：選項為 radio group，role="radiogroup"、aria-label 題目、各選項 role="radio" aria-checked */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                role="radiogroup"
                aria-label={displayQuestions[currentQuestion].question}
                aria-labelledby="quiz-question-text"
              >
                {displayQuestions[currentQuestion].options.map((option, index) => (
                  <m.button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={answers[currentQuestion] === option.trait}
                    aria-label={`${t('common.questionProgress', { current: currentQuestion + 1, total: displayQuestions.length })}，選項：${option.text}`}
                    className={`glass-card-spotlight p-6 md:p-8 py-3 px-4 text-left group flex items-center gap-4 md:gap-6 min-h-[48px] rounded-xl border transition-all duration-200 border-white/10 hover:border-primary-500/40 hover:bg-white/5 active:scale-[0.98] games-focus-ring ${answers[currentQuestion] === option.trait ? 'border-primary-500 bg-primary-500/10' : ''
                      }`}
                    onClick={() => handleAnswer(option.id, option.trait)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex-shrink-0 p-3 rounded-xl bg-white/5 group-hover:bg-primary-500/20 text-white/70 group-hover:text-primary-500 transition-colors flex items-center justify-center w-12 h-12" aria-hidden>
                      <option.icon className="w-6 h-6" />
                    </div>
                    <span className="text-lg text-white group-hover:text-white/90 font-medium flex-1 text-left">
                      {option.text}
                    </span>
                  </m.button>
                ))}
              </div>
            </m.div>
          )}

          {/* Result 66-70：雷達圖、味覺 DNA、分享 IG、74 探索更多；T122 P1：動態內容 aria-live */}
          {step === 'result' && result && (
            <m.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-4xl mx-auto"
              role="region"
              aria-live="polite"
              aria-atomic="true"
              aria-label="測驗結果"
            >
              <div className="glass-card rounded-2xl shadow-glass-1 p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-[100px]" />

                <div className="relative z-10 text-center mb-12">
                  {/* Phase 1 C2.1: 成就圖標彈出動畫 */}
                  <m.div
                    className="flex justify-center mb-8 achievement-pop badge-glow"
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.68, -0.55, 0.265, 1.55],
                      delay: 0.2
                    }}
                  >
                    <FeatureIcon icon={result.icon} size="lg" color="primary" />
                  </m.div>
                  <span className="inline-block px-4 py-1 rounded-full border border-white/20 text-white/50 text-sm tracking-widest uppercase mb-2">
                    {t('quiz.yourSoulWine')}
                  </span>
                  <p className="text-white/50 text-xs mb-2" aria-hidden>根據你的回答（共 18 題）</p>
                  {/* 68 你的味覺 DNA 獨特標籤；AUDIT #24 結果頁主標題 h1 */}
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-400 border border-secondary-500/40 text-xs font-bold uppercase tracking-wider mb-4">
                    你的味覺 DNA
                  </span>
                  <m.h1
                    className="text-4xl md:text-6xl font-display font-bold gradient-text mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {result.name}
                  </m.h1>
                  <p className="text-2xl text-white/70 font-display italic">&quot;{result.type}&quot;</p>
                  {result.shortReason && (
                    <p className="text-white/60 text-sm mt-2 max-w-lg mx-auto" aria-label="推薦理由">
                      {result.shortReason}
                    </p>
                  )}
                </div>

                {/* 67 口味特徵雷達圖（特質維度） */}
                <div className="relative z-10 mb-10 flex flex-col items-center">
                  <p className="text-white/50 text-sm mb-3">口味特徵</p>
                  <TraitRadarChart traits={result.traits} />
                </div>

                {/* 66 結果酒款酒瓶圖片佔位（可接入酒款圖片 API） */}
                <div className="relative z-10 mb-10 flex justify-center">
                  <div className="w-32 h-40 md:w-40 md:h-48 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2" aria-hidden>
                    <Wine className="w-12 h-12 text-primary-500/60" />
                    <span className="text-white/30 text-xs">酒款示意圖</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                  <div>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <FeatureIcon icon={Zap} size="sm" color="white" />
                      深度解析
                    </h3>
                    <p className="text-white/60 leading-relaxed text-lg mb-4">
                      {result.description}
                    </p>
                    {/* T039 P2 / AUDIT #25：可搭配無酒精區塊 role="note" 與 aria-label */}
                    <p className="text-white/50 text-sm mb-8" role="note" aria-label="可搭配無酒精飲料說明">
                      推薦酒款可搭配無酒精飲料，不強制飲酒。想純玩派對遊戲可選「只要遊戲推薦」重新測驗。
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.traits.map((t, i) => (
                        <m.span
                          key={t}
                          className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/70 uppercase tracking-wider"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                        >
                          {t}
                        </m.span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FeatureIcon icon={Star} size="sm" color="white" />
                        完美搭配
                      </h3>
                      <p className="text-white/50 text-xs mb-2">搭餐建議</p>
                      <ul className="space-y-2 mb-4">
                        {result.pairing.map(p => (
                          <li key={p} className="flex items-center gap-3 text-white/60">
                            <ChevronRight className="w-4 h-4 text-primary-500" />
                            {p}
                          </li>
                        ))}
                      </ul>
                      {/* 69 推薦餐酒搭配照片佔位 */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {result.pairing.slice(0, 3).map((p) => (
                          <div key={p} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 p-2">
                            <div className="w-full flex-1 rounded-lg bg-white/5 flex items-center justify-center min-h-[48px]">
                              <Star className="w-5 h-5 text-primary-500/40" />
                            </div>
                            <span className="text-white/50 text-[10px] truncate w-full text-center">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border-l-4 border-primary-500">
                      <p className="text-white/80 italic font-display">
                        {result.quote}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 73 歷史測驗結果對比 */}
                {lastResult && (
                  <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-white/50 text-sm mb-2">上次 vs 這次</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                      <span className="text-white/70">
                        上次：<strong className="text-primary-400">{lastResult.name}</strong>（{lastResult.type}）
                      </span>
                      <span className="text-white/40">|</span>
                      <span className="text-white/90">
                        這次：<strong className="text-secondary-400">{result.name}</strong>（{result.type}）
                      </span>
                    </div>
                  </div>
                )}

                {/* E2 148：你的選擇解析（每題選項對應特質） */}
                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary-400" />
                    你的選擇解析
                  </h3>
                  <p className="text-white/50 text-sm mb-4">每題選擇反映你的特質傾向</p>
                  <ul className="space-y-3 max-h-48 overflow-y-auto">
                    {displayQuestions.map((q, i) => {
                      const trait = answers[i]
                      const opt = q.options.find((o) => o.trait === trait)
                      return (
                        <li key={q.id} className="text-sm">
                          <span className="text-white/50">{t('common.questionOrdinal', { n: i + 1 })}：</span>
                          <span className="text-white/80">「{opt?.text ?? trait}」</span>
                          <span className="text-white/40"> → {trait}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* 71-72 未登入提示：登入保存你的靈魂酒 */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-primary-400 text-sm transition-colors"
                  >
                    登入保存你的靈魂酒，免費註冊
                  </Link>
                </div>

                {/* EXPERT_60 P0：結果頁 CTA「查看推薦」優先於次要動作 */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-4">
                  {/* AUDIT #30：結果頁 CTA aria-label 明確 */}
                  <Link
                    href="/assistant"
                    className="btn-primary min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring"
                    aria-label="前往 AI 侍酒師查看推薦"
                  >
                    <Sparkles className="w-4 h-4" />
                    查看推薦
                  </Link>
                  <button onClick={handleReset} className="btn-secondary min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring" aria-label="重新測驗，再測一次">
                    <RotateCcw className="w-4 h-4" />
                    重新測驗
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareResult(result)}
                    className="btn-secondary min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring"
                    aria-label="分享測驗結果"
                  >
                    <Share2 className="w-6 h-6 shrink-0" aria-hidden />
                    分享
                  </button>
                  <a
                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(getShareBaseUrl() + '/quiz')}&text=${encodeURIComponent(t('quiz.shareText').replace(/\{\{\s*name\s*\}\}/g, result.name).replace(/\{\{\s*type\s*\}\}/g, result.type))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring"
                    aria-label="分享到 LINE"
                  >
                    分享到 LINE
                  </a>
                  {/* AUDIT #50：結果頁加「探索更多酒款」連到 /assistant 或 /learn */}
                  <Link
                    href="/assistant"
                    className="btn-ghost min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring"
                    aria-label="探索更多酒款"
                  >
                    探索更多酒款
                  </Link>
                </div>
                {/* E40：靈魂酒測結果頁交叉推薦 — 進階課程、派對遊戲 */}
                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap justify-center gap-4" role="region" aria-label="推薦課程與派對遊戲">
                  <Link href="/learn" className="inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-300 hover:bg-primary-500/30 transition-colors text-sm font-medium games-focus-ring" aria-label="前往品酒學院">
                    <BookOpen className="w-4 h-4" />
                    推薦課程
                  </Link>
                  <Link href="/games" className="inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-xl bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-colors text-sm font-medium games-focus-ring" aria-label="前往派對遊樂場">
                    <Gamepad2 className="w-4 h-4" />
                    來玩派對遊戲
                  </Link>
                </div>
              </div>
            </m.div>
          )}

          {/* T031 P1：只要遊戲推薦結果（無酒款） */}
          {step === 'result' && preferGamesOnly && gamesOnlySuggested.length > 0 && (
            <m.div
              key="result-games"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-4xl mx-auto"
              role="region"
              aria-live="polite"
              aria-atomic="true"
              aria-label="派對遊戲推薦結果"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-500/20 to-transparent rounded-full blur-[100px]" />
                <div className="relative z-10 text-center mb-10">
                  <div className="flex justify-center mb-6">
                    <FeatureIcon icon={Zap} size="lg" color="accent" />
                  </div>
                  <span className="inline-block px-4 py-1 rounded-full border border-white/20 text-white/50 text-sm tracking-widest uppercase mb-2">
                    你的派對遊戲推薦
                  </span>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
                    不喝酒也能玩
                  </h2>
                  <p className="text-white/60 max-w-lg mx-auto">
                    依你的選擇推薦以下派對遊戲，懲罰可自訂、不飲酒也能同樂。
                  </p>
                </div>
                <ul className="relative z-10 space-y-3 mb-10 max-w-md mx-auto">
                  {gamesOnlySuggested.map((g) => (
                    <li key={g.id}>
                      <Link
                        href={`/games?game=${g.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-500/30 transition-colors text-left min-h-[48px] games-focus-ring"
                      >
                        <ChevronRight className="w-5 h-5 text-accent-400 shrink-0" />
                        <span className="font-medium text-white">{g.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="relative z-10 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/games"
                    className="btn-primary min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring"
                    aria-label="前往派對遊樂場"
                  >
                    <Sparkles className="w-4 h-4" />
                    去玩遊戲
                  </Link>
                  <button onClick={handleReset} className="btn-secondary min-h-[48px] min-w-[48px] flex items-center gap-2 games-focus-ring" aria-label="重新測驗">
                    <RotateCcw className="w-4 h-4" />
                    重新測驗
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* E2 150：測驗歷史彈窗；Quiz 頁 20 項優化 #3 #4 #20：焦點陷阱、Esc、aria-labelledby */}
        {showHistoryModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-history-dialog-title"
          >
            <m.div
              ref={historyModalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 id="quiz-history-dialog-title" className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-400" />
                  測驗歷史
                </h2>
                <ModalCloseButton ref={historyModalCloseButtonRef} onClick={() => setShowHistoryModal(false)} aria-label="關閉" className="rounded-full text-white/70" />
              </div>
              <div className="overflow-y-auto space-y-2 flex-1 min-h-0">
                {quizHistory.length === 0 ? (
                  /** Quiz 頁 20 項優化 #14：歷史彈窗空狀態 — 友善文案與 CTA */
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <History className="w-12 h-12 text-white/20 mb-4" aria-hidden />
                    <p className="text-white/60 font-medium mb-1">尚無測驗記錄</p>
                    <p className="text-white/40 text-sm mb-6">完成靈魂酒測後會顯示在這裡</p>
                    <button
                      type="button"
                      onClick={() => { setShowHistoryModal(false); setStep('intro'); }}
                      className="btn-primary min-h-[48px] min-w-[48px] games-focus-ring"
                      aria-label="開始靈魂酒測"
                    >
                      開始靈魂酒測
                    </button>
                  </div>
                ) : (
                  [...quizHistory].reverse().map((item, i) => (
                    <div
                      key={`${item.date}-${i}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-white/50 text-sm">{item.type}</p>
                      </div>
                      <span className="text-white/40 text-xs shrink-0">
                        {new Date(item.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </m.div>
          </div>
        )}
      </div>
    </div>
  )
}
