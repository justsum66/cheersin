'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Award, Loader2, Zap, HelpCircle } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { useTriviaQuestions } from '@/hooks/useTriviaQuestions'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

type Difficulty = 'easy' | 'medium' | 'hard'
type TriviaQ = { q: string; a: string[]; correct: number; difficulty: Difficulty }

const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: '易', medium: '中', hard: '難' }

const questionsRaw: (Omit<TriviaQ, 'difficulty'> & { difficulty: Difficulty })[] = [
  { q: '香檳（Champagne）只能產自哪個國家？', a: ['法國', '義大利', '西班牙', '美國'], correct: 0, difficulty: 'easy' },
  { q: '哪種葡萄品種被稱為「紅酒之王」？', a: ['Merlot', 'Pinot Noir', 'Cabernet Sauvignon', 'Syrah'], correct: 2, difficulty: 'medium' },
  { q: '這杯酒如果有「軟木塞味」（Corked），聞起來像什麼？', a: ['花香', '濕紙板', '醋味', '焦糖'], correct: 1, difficulty: 'medium' },
  { q: '清酒的原料主要是什麼？', a: ['小麥', '大麥', '米', '馬鈴薯'], correct: 2, difficulty: 'easy' },
  { q: '威士忌「單一麥芽」（Single Malt）的意思是？', a: ['只用一種麥芽', '來自單一酒廠', '只蒸餾一次', '單一木桶陳年'], correct: 1, difficulty: 'medium' },
  { q: '葡萄酒的「單寧」主要來自哪裡？', a: ['果肉', '葡萄皮與籽', '酵母', '木桶'], correct: 1, difficulty: 'medium' },
  { q: '「氣泡酒」與「香檳」的關係是？', a: ['相同', '香檳是氣泡酒的一種', '氣泡酒是香檳的一種', '無關'], correct: 1, difficulty: 'easy' },
  { q: '品酒時「掛杯」主要代表什麼？', a: ['酒精度較高', '甜度較高', '酸度較高', '品質較好'], correct: 0, difficulty: 'medium' },
  { q: '「Dry」在酒標上通常表示？', a: ['不甜', '很甜', '酸', '苦'], correct: 0, difficulty: 'easy' },
  { q: '啤酒的主要原料除了麥芽外還有？', a: ['米', '啤酒花', '葡萄', '甘蔗'], correct: 1, difficulty: 'easy' },
  { q: 'Prosecco 氣泡酒主要產自哪國？', a: ['法國', '西班牙', '義大利', '德國'], correct: 2, difficulty: 'easy' },
  { q: '「陳年」對紅酒的主要影響是？', a: ['變甜', '單寧柔化、風味複雜', '變酸', '變苦'], correct: 1, difficulty: 'medium' },
  { q: 'Tequila 的原料龍舌蘭主要產自？', a: ['古巴', '墨西哥', '牙買加', '巴西'], correct: 1, difficulty: 'easy' },
  { q: '「Nose」在品酒術語中指？', a: ['口感', '香氣', '餘韻', '色澤'], correct: 1, difficulty: 'medium' },
  { q: '香檳法（傳統法）的二次發酵在哪裡進行？', a: ['不鏽鋼槽', '瓶中', '木桶', '槽中'], correct: 1, difficulty: 'hard' },
  { q: '冰酒（Ice Wine）的葡萄採收時機是？', a: ['夏季', '秋季', '冬季冰凍時', '春季'], correct: 2, difficulty: 'medium' },
  { q: '蘇格蘭威士忌必須在蘇格蘭陳年至少幾年？', a: ['1 年', '2 年', '3 年', '5 年'], correct: 2, difficulty: 'hard' },
  { q: '「Brut」在氣泡酒標上表示？', a: ['很甜', '不甜或極干', '半甜', '甜'], correct: 1, difficulty: 'medium' },
  { q: '紅酒適飲溫度大約是？', a: ['冰鎮 5°C', '室溫 18–20°C', '溫熱 30°C', '常溫即可'], correct: 1, difficulty: 'easy' },
  { q: 'Pinot Noir 通常與哪個產區最著名？', a: ['納帕', '波爾多', '勃艮第', '里奧哈'], correct: 2, difficulty: 'medium' },
  { q: '「Corked」酒的主要成因是？', a: ['氧化', 'TCA 軟木塞污染', '過度陳年', '保存不當'], correct: 1, difficulty: 'hard' },
  { q: '雪莉酒（Sherry）產自哪國？', a: ['葡萄牙', '西班牙', '義大利', '希臘'], correct: 1, difficulty: 'easy' },
  { q: '「單寧」在口中的感覺通常是？', a: ['甜', '澀、收斂', '酸', '辣'], correct: 1, difficulty: 'medium' },
  { q: '波爾多混釀常包含哪兩種葡萄？', a: ['Chardonnay + Sauvignon', 'Cabernet + Merlot', 'Pinot + Syrah', 'Riesling + Gewürz'], correct: 1, difficulty: 'hard' },
  { q: '啤酒的「IBU」指的是？', a: ['酒精度', '苦度', '甜度', '色度'], correct: 1, difficulty: 'medium' },
  { q: '日本清酒「大吟釀」的精米步合通常？', a: ['70% 以上', '60% 以下', '50% 以下', '80% 以上'], correct: 2, difficulty: 'hard' },
  { q: '「氧化」對酒的典型影響是？', a: ['變甜', '變苦、失去果香', '變酸', '無影響'], correct: 1, difficulty: 'medium' },
  { q: 'Riesling 最常與哪個產區聯想？', a: ['波爾多', '納帕', '德國／阿爾薩斯', '澳洲'], correct: 2, difficulty: 'medium' },
  { q: '「Finish」在品酒中指？', a: ['開瓶方式', '餘韻、尾韻', '第一印象', '色澤'], correct: 1, difficulty: 'medium' },
  { q: '香檳的 AOC 法定產區主要在哪一區？', a: ['Loire', 'Champagne', 'Burgundy', 'Alsace'], correct: 1, difficulty: 'hard' },
]

/** 依難度篩選後洗牌取前 count 題 */
function shuffleQuestions(count: number, difficultyFilter: Difficulty | 'all'): TriviaQ[] {
  const filtered = difficultyFilter === 'all'
    ? [...questionsRaw]
    : questionsRaw.filter((item) => item.difficulty === difficultyFilter)
  const pool = filtered.length < count ? [...questionsRaw] : filtered
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map((item) => {
    const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
    const newA = indices.map((i) => item.a[i])
    const newCorrect = indices.indexOf(item.correct)
    return { q: item.q, a: newA, correct: newCorrect, difficulty: item.difficulty }
  })
}

type DifficultyFilter = Difficulty | 'all'
const FILTER_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'easy', label: '易' },
  { value: 'medium', label: '中' },
  { value: 'hard', label: '難' },
]

const TIMER_OPTIONS = [10, 15, 20] as const

/** R2-025：使用 useTriviaQuestions 取得題目，API 失敗或不足時 fallback 本地題庫 */
function useTriviaQuestionsWithFallback(count: number, difficultyFilter: DifficultyFilter, refetchKey: number) {
  const difficultyParam = difficultyFilter === 'all' ? '' : difficultyFilter
  const { data, isLoading, isFetching } = useTriviaQuestions(count, difficultyParam, refetchKey)
  const questions: TriviaQ[] = useMemo(() => {
    const list = data?.questions
    if (Array.isArray(list) && list.length >= 3) {
      return list.slice(0, count).map((item) => ({
        q: item.q,
        a: item.a,
        correct: item.correct,
        difficulty: (item.difficulty as Difficulty) || 'medium',
      }))
    }
    return shuffleQuestions(count, difficultyFilter)
  }, [data, count, difficultyFilter])
  return { questions, isLoading: isLoading || isFetching }
}

export default function Trivia() {
  const { t } = useTranslation()
  const { play } = useGameSound()
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
  const [refetchKey, setRefetchKey] = useState(0)
  const { questions: QUESTIONS } = useTriviaQuestionsWithFallback(8, difficultyFilter, refetchKey)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  /** R2-112：提交答案時短暫顯示載入態，再顯示勾/叉 */
  const [submittingIndex, setSubmittingIndex] = useState<number | null>(null)
  const [wrongAnswers, setWrongAnswers] = useState<{ q: string; correct: string; picked: string }[]>([])
  const [answerHistory, setAnswerHistory] = useState<('correct' | 'wrong')[]>([])
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState<typeof TIMER_OPTIONS[number]>(15)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextQuestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restartRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  // G3-022: Combo floating text
  const [showCombo, setShowCombo] = useState(false)
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // G3-024: 50/50 lifeline
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false)
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([])
  // G3-025: Review mode - track all answered questions
  const [allAnswers, setAllAnswers] = useState<{ q: string; options: string[]; correct: number; picked: number | null; isCorrect: boolean }[]>([])
  const [showFullReview, setShowFullReview] = useState(false)

  const clearTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimeLeft(null)
  }

  useEffect(() => {
    if (!timerEnabled || showResult || isAnswered || !QUESTIONS[current]) return
    setTimeLeft(timerSeconds)
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev == null || prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps -- QUESTIONS constant; isAnswered omitted to run once per question
  }, [current, showResult, timerEnabled, timerSeconds])

  // G3-021: Heartbeat sound when timer < 5s
  useEffect(() => {
    if (!timerEnabled || timeLeft == null || timeLeft > 5 || timeLeft <= 0 || isAnswered) return
    play('countdown')
  }, [timeLeft, timerEnabled, isAnswered, play])

  const timeoutFiredRef = useRef(false)
  useEffect(() => {
    if (timeLeft !== 0 || isAnswered || timeoutFiredRef.current) return
    const q = QUESTIONS[current]
    if (!q) return
    timeoutFiredRef.current = true
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setSelected(null)
    setIsAnswered(true)
    setStreak(0)
    setWrongAnswers((prev) => [...prev, { q: q.q, correct: q.a[q.correct], picked: '（逾時）' }])
    setAnswerHistory((prev) => [...prev, 'wrong'].slice(-5) as ('correct' | 'wrong')[])
    clearTimer()
    if (nextQuestionTimeoutRef.current) clearTimeout(nextQuestionTimeoutRef.current)
    nextQuestionTimeoutRef.current = setTimeout(() => {
      nextQuestionTimeoutRef.current = null
      if (current < QUESTIONS.length - 1) {
        setCurrent(current + 1)
        setSelected(null)
        setIsAnswered(false)
        timeoutFiredRef.current = false
      } else {
        setShowResult(true)
      }
    }, 1500)
  }, [timeLeft, current, isAnswered, QUESTIONS, play])

  useEffect(() => {
    timeoutFiredRef.current = false
  }, [current])

  useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current)
        nextQuestionTimeoutRef.current = null
      }
    }
  }, [])

  const handleAnswer = (index: number) => {
    if (isAnswered || submittingIndex != null) return
    clearTimer()
    const q = QUESTIONS[current]
    setSubmittingIndex(index)
    setTimeout(() => {
      setSelected(index)
      setIsAnswered(true)
      setSubmittingIndex(null)
      const correct = index === q.correct
      setAnswerHistory((prev) => [...prev, correct ? 'correct' : 'wrong'].slice(-5) as ('correct' | 'wrong')[])
      if (correct) {
        play('correct')
        setScore(score + 1)
        setStreak((s) => {
          const next = s + 1
          setMaxStreak((m) => Math.max(m, next))
          // G3-022: Show combo text on streaks >= 2
          if (next >= 2) {
            setShowCombo(true)
            if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current)
            comboTimeoutRef.current = setTimeout(() => {
              comboTimeoutRef.current = null
              setShowCombo(false)
            }, 1200)
          }
          return next
        })
      } else {
        play('wrong')
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
        setStreak(0)
        setShowCombo(false)
        setWrongAnswers((prev) => [...prev, { q: q.q, correct: q.a[q.correct], picked: q.a[index] }])
      }
      // G3-025: Track all answers for review
      setAllAnswers((prev) => [...prev, { q: q.q, options: q.a, correct: q.correct, picked: index, isCorrect: correct }])
      if (nextQuestionTimeoutRef.current) clearTimeout(nextQuestionTimeoutRef.current)
      nextQuestionTimeoutRef.current = setTimeout(() => {
        nextQuestionTimeoutRef.current = null
        if (current < QUESTIONS.length - 1) {
          setCurrent(current + 1)
          setSelected(null)
          setIsAnswered(false)
          setHiddenOptions([]) // G3-024: Reset 50/50 for next question
        } else {
          setShowResult(true)
        }
      }, 1500)
    }, 380)
  }

  const handleAnswerRef = useRef(handleAnswer)
  handleAnswerRef.current = handleAnswer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showResult) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          restartRef.current?.focus()
        }
        return
      }
      if (isAnswered) return
      const n = e.key === '1' ? 0 : e.key === '2' ? 1 : e.key === '3' ? 2 : e.key === '4' ? 3 : -1
      if (n >= 0 && QUESTIONS[current]?.a && n < QUESTIONS[current].a.length) {
        e.preventDefault()
        handleAnswerRef.current(n)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, isAnswered, showResult, QUESTIONS])

  /** 換題時將焦點移到第一個選項，便於鍵盤操作 */
  useEffect(() => {
    if (showResult) return
    const first = optionRefs.current[0]
    if (first) {
      const t = setTimeout(() => first.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [current, showResult])

  /** 結果頁顯示時焦點移到「再玩一次」 */
  useEffect(() => {
    if (!showResult) return
    const t = setTimeout(() => restartRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [showResult])

  const restart = () => {
    clearTimer()
    setRefetchKey((k) => k + 1)
    setCurrent(0)
    setScore(0)
    setAnswerHistory([])
    setShowResult(false)
    setSelected(null)
    setIsAnswered(false)
    setWrongAnswers([])
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(null)
    setFiftyFiftyUsed(false)
    setHiddenOptions([])
    setAllAnswers([])
    setShowFullReview(false)
    setShowCombo(false)
    setTimeout(() => restartRef.current?.focus(), 100)
  }

  if (showResult) {
    const lowScore = QUESTIONS.length ? score <= Math.min(2, Math.ceil(QUESTIONS.length * 0.25)) : false
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full text-center"
        data-testid="trivia-result"
        initial={lowScore ? { opacity: 1 } : {}}
        animate={lowScore ? { x: [0, -8, 8, -6, 6, 0], boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 60px 20px rgba(239,68,68,0.15)', '0 0 0 0 rgba(239,68,68,0)'] } : {}}
        transition={lowScore ? { duration: 0.6, ease: 'easeOut' } : {}}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-8 shadow-glow"
        >
          <Award className="w-16 h-16 text-white" />
        </motion.div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">測驗完成！</h2>
        <div className="text-5xl md:text-6xl font-display font-bold gradient-text mb-6 tabular-nums">
          <AnimatedNumber value={score} /> / {QUESTIONS.length}
        </div>

        <p className="text-white/50 mb-4 text-lg md:text-xl">
          {score === QUESTIONS.length ? '你是真正的酒神！' : score > 2 ? '不錯喔，略懂略懂。' : '再多喝幾杯練習一下吧！'}
        </p>
        <p className="text-white/60 text-sm mb-1">答對率 {QUESTIONS.length ? Math.round((score / QUESTIONS.length) * 100) : 0}% · 本局最高連續答對 {maxStreak} 題</p>
        {wrongAnswers.length > 0 && (
          <div className="w-full max-w-md text-left mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-bold text-sm mb-2">錯題複習</h3>
            <ul className="space-y-2 text-sm">
              {wrongAnswers.map((item, i) => (
                <li key={i} className="text-white/80">
                  <span className="text-white/50 block">{item.q}</span>
                  <span className="text-red-400/90">你選：{item.picked}</span>
                  <span className="text-green-400/90 ml-2">正確：{item.correct}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* G3-025: Full review mode toggle */}
        <button
          type="button"
          onClick={() => setShowFullReview((v) => !v)}
          className="text-primary-400 hover:text-primary-300 text-sm underline mb-4 games-focus-ring"
        >
          {showFullReview ? '收起完整複習' : '📋 查看完整複習'}
        </button>
        <AnimatePresence>
          {showFullReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md text-left mb-4 p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <h3 className="text-white font-bold text-sm mb-3">全部題目複習</h3>
              <ul className="space-y-3 text-sm">
                {allAnswers.map((item, i) => (
                  <li key={i} className={`p-3 rounded-lg border ${item.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <p className="text-white/80 font-medium mb-1">{i + 1}. {item.q}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {item.options.map((opt, j) => (
                        <span
                          key={j}
                          className={`px-2 py-1 rounded ${j === item.correct
                            ? 'bg-green-500/20 text-green-400 font-bold'
                            : j === item.picked && !item.isCorrect
                              ? 'bg-red-500/20 text-red-400'
                              : 'text-white/40'
                            }`}
                        >
                          {opt} {j === item.correct ? '✓' : j === item.picked && !item.isCorrect ? '✗' : ''}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        <CopyResultButton
          text={`酒神隨堂考 得分：${score}/${QUESTIONS.length}（答對率 ${QUESTIONS.length ? Math.round((score / QUESTIONS.length) * 100) : 0}%）${score === QUESTIONS.length ? ' 你是真正的酒神！' : score > 2 ? ' 不錯喔，略懂略懂。' : ' 再多喝幾杯練習一下吧！'}`}
          label="分享成績"
          className="mb-4"
        />
        <p className="text-white/40 text-sm mb-2">下次出題難度</p>
        <div className="flex gap-2 mb-6" role="group" aria-label="出題難度">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficultyFilter(value)}
              aria-pressed={difficultyFilter === value}
              className={`min-h-[48px] min-w-[48px] px-3 py-1 rounded-lg text-xs font-medium transition-colors ${difficultyFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button ref={restartRef} type="button" onClick={restart} className="btn-primary" autoFocus aria-label={t('games.playAgain')} data-testid="trivia-restart">
          {t('games.playAgain')}
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center px-4 safe-area-px" role="main" aria-label="知識問答">
      <GameRules rules={`答對不喝、答錯請喝。\n快捷鍵：1–4 選擇選項。`} />
      {/* 進度條；R2-120 多輪進度指示器：圓點 + 進度條 */}
      <div className="mb-2 flex items-center gap-1.5 flex-wrap">
        {QUESTIONS.map((_, i) => (
          <motion.span
            key={i}
            className={`shrink-0 w-2 h-2 rounded-full ${i < current ? 'bg-primary-500' : i === current ? 'bg-primary-400' : 'bg-white/20'}`}
            initial={false}
            animate={{ scale: i === current ? 1.2 : 1, opacity: i <= current ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />
        ))}
      </div>
      <div className="mb-4 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2 items-center border-b border-white/10 pb-3">
        <span className="text-primary-500 font-mono tracking-widest uppercase text-sm">{t('common.questionProgress', { current: current + 1, total: QUESTIONS.length })}</span>
        <span className="text-white/40 text-sm" aria-label="難度">{DIFFICULTY_LABEL[QUESTIONS[current].difficulty]}</span>
        <span className="text-white/50 text-sm ml-auto">得分：<AnimatedNumber value={score} className="tabular-nums" /></span>
        {streak >= 2 && (
          <span className="text-amber-400 text-xs font-bold ml-1">🔥 x{streak}</span>
        )}
        {answerHistory.length > 0 && (
          <span className="text-white/40 text-xs ml-2" role="status" aria-live="polite">本局最近：{answerHistory.map((o) => (o === 'correct' ? '✓' : '✗')).join(' ')}</span>
        )}
      </div>
      {/* G3-024: 50/50 Lifeline */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <span className="text-white/50 text-xs mr-1">出題難度</span>
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button key={value} type="button" onClick={() => setDifficultyFilter(value)} aria-pressed={difficultyFilter === value}
            className={`min-h-[48px] px-3 py-1 rounded-lg text-xs font-medium transition-colors games-focus-ring ${difficultyFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
            {label}
          </button>
        ))}
        <label className="flex items-center gap-1.5 ml-2 text-white/60 text-xs">
          <input type="checkbox" checked={timerEnabled} onChange={(e) => { setTimerEnabled(e.target.checked); clearTimer(); }} className="rounded" />
          倒數
        </label>
        {timerEnabled && TIMER_OPTIONS.map((sec) => (
          <button key={sec} type="button" onClick={() => setTimerSeconds(sec)} aria-pressed={timerSeconds === sec}
            className={`min-h-[48px] min-w-[48px] px-2 py-0.5 rounded text-xs games-focus-ring ${timerSeconds === sec ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70'}`}>{sec}秒</button>
        ))}
        {/* G3-024: 50/50 lifeline button */}
        {!fiftyFiftyUsed && !isAnswered && (
          <button
            type="button"
            onClick={() => {
              const q = QUESTIONS[current]
              if (!q || fiftyFiftyUsed) return
              setFiftyFiftyUsed(true)
              // Remove 2 wrong answers
              const wrongIndices = q.a.map((_, i) => i).filter((i) => i !== q.correct)
              const shuffled = wrongIndices.sort(() => Math.random() - 0.5)
              setHiddenOptions(shuffled.slice(0, 2))
              play('click')
            }}
            className="min-h-[48px] px-3 py-1 rounded-lg text-xs font-medium transition-colors games-focus-ring bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 flex items-center gap-1"
            aria-label="50/50 移除兩個錯誤答案"
          >
            <HelpCircle className="w-3 h-3" /> 50/50
          </button>
        )}
        {fiftyFiftyUsed && (
          <span className="text-white/30 text-xs ml-1">50/50 已用</span>
        )}
      </div>
      {timerEnabled && timeLeft != null && !isAnswered && (
        <motion.div
          className="flex items-center gap-3 mb-2"
          role="timer"
          aria-live="polite"
          aria-label={`剩餘 ${timeLeft} 秒`}
          animate={timeLeft <= 5 ? {
            boxShadow: ['0 0 0 0 rgba(248,113,113,0)', '0 0 0 8px rgba(248,113,113,0.25)', '0 0 0 0 rgba(248,113,113,0)'],
          } : {}}
          transition={timeLeft <= 5 ? { repeat: Infinity, duration: 1.2 } : {}}
        >
          {/* G3-021: Heartbeat pulsation on timer circle */}
          <motion.span
            className="relative w-10 h-10 shrink-0"
            animate={timeLeft <= 5 ? { scale: [1, 1.15, 1] } : {}}
            transition={timeLeft <= 5 ? { repeat: Infinity, duration: 0.6, ease: 'easeInOut' } : {}}
          >
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <path
                d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                fill="none"
                stroke={timeLeft <= 5 ? 'rgb(248,113,113)' : 'rgb(168,85,247)'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="97.3"
                animate={{ strokeDashoffset: 97.3 * (1 - timeLeft / (timerSeconds ?? 15)) }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </motion.span>
          <p className={`text-sm font-mono tabular-nums ${timeLeft <= 5 ? 'text-red-400 font-semibold' : 'text-primary-400'}`}>剩餘 {timeLeft} 秒</p>
        </motion.div>
      )}
      <h2 className="text-lg md:text-2xl font-bold text-white mb-6 leading-relaxed" id="trivia-question">
        {QUESTIONS[current].q}
        {/* G3-023: Category tag – show difficulty badge */}
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full inline-block align-middle ${QUESTIONS[current].difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
          QUESTIONS[current].difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-green-500/20 text-green-400'
          }`}>{DIFFICULTY_LABEL[QUESTIONS[current].difficulty]}</span>
      </h2>
      {/* G3-022: Combo streak floating text */}
      <AnimatePresence>
        {showCombo && streak >= 2 && (
          <motion.div
            key={`combo-${streak}`}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1.2 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-2"
          >
            <span className="text-amber-400 font-black text-2xl drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
              <Zap className="w-5 h-5 inline mr-1" />Combo x{streak}!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {isAnswered && (
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {selected === QUESTIONS[current].correct ? '答對' : '答錯'}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3" role="group" aria-labelledby="trivia-question">
        {QUESTIONS[current].a.map((opt, i) => (
          <motion.button
            key={i}
            ref={(el) => { optionRefs.current[i] = el }}
            type="button"
            onClick={() => handleAnswer(i)}
            disabled={isAnswered || submittingIndex != null || hiddenOptions.includes(i)}
            aria-label={submittingIndex === i ? '提交中' : `選項 ${i + 1}：${opt}`}
            initial={false}
            animate={isAnswered && selected === i ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } } : {}}
            className={`p-4 md:p-5 rounded-xl text-left text-base md:text-lg font-medium transition-colors games-focus-ring flex items-center justify-between border min-h-[48px] ${hiddenOptions.includes(i)
              ? 'opacity-20 pointer-events-none bg-white/5 border-white/5 text-white/30'
              : isAnswered && i === QUESTIONS[current].correct
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : isAnswered && selected === i && i !== QUESTIONS[current].correct
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
          >
            <span><span className="text-white/50 mr-2">{i + 1}.</span>{opt}</span>
            {submittingIndex === i && (
              <span className="flex-shrink-0" aria-hidden>
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              </span>
            )}
            {isAnswered && submittingIndex === null && i === QUESTIONS[current].correct && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="flex-shrink-0" aria-hidden>
                <Check className="w-5 h-5 md:w-6 md:h-6" />
              </motion.span>
            )}
            {isAnswered && selected === i && i !== QUESTIONS[current].correct && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="flex-shrink-0" aria-hidden>
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
      <p className="text-white/30 text-xs mt-4">快捷鍵：1–4 選擇選項</p>
    </div>
  )
}
