'use client'

/**
 * LEARN-045 / P2.B3.4: 學習夥伴 + 番茄鐘專注模式
 * - 功能預覽清單
 * - LEARN-045: Pomodoro 計時器 + 閱讀模式
 * - 返回導航
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Users, Target, MessageCircle, Bell, Play, Pause, RotateCcw, Coffee } from 'lucide-react'

const PREVIEW_FEATURES = [
  { icon: Target, title: '智能配對', desc: '依學習進度、興趣自動配對同路人' },
  { icon: MessageCircle, title: '互相督促', desc: '私訊鼓勵、分享筆記、共同設定目標' },
  { icon: Bell, title: '進度提醒', desc: '夥伴完成章節時收到通知，互相激勵' },
]

/** LEARN-045: Pomodoro 學習計時器 */
const POMODORO_WORK = 25 * 60 // 25 minutes
const POMODORO_BREAK = 5 * 60 // 5 minutes

function PomodoroTimer() {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(mode === 'work' ? POMODORO_WORK : POMODORO_BREAK)
  }, [mode])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRunning(false)
          if (mode === 'work') {
            setSessions(s => s + 1)
            setMode('break')
            return POMODORO_BREAK
          } else {
            setMode('work')
            return POMODORO_WORK
          }
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const pct = mode === 'work'
    ? ((POMODORO_WORK - timeLeft) / POMODORO_WORK) * 100
    : ((POMODORO_BREAK - timeLeft) / POMODORO_BREAK) * 100

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode === 'work' ? (
            <Target className="w-5 h-5 text-primary-400" />
          ) : (
            <Coffee className="w-5 h-5 text-amber-400" />
          )}
          <span className="text-sm font-semibold text-white">
            {mode === 'work' ? '專注學習' : '休息一下'}
          </span>
        </div>
        <span className="text-xs text-white/40">已完成 {sessions} 個番茄鐘</span>
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={mode === 'work' ? 'rgba(var(--color-primary-500), 0.8)' : 'rgba(251, 191, 36, 0.8)'}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-xs text-white/40 mt-1">
              {mode === 'work' ? '閱讀時間' : '休息時間'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-[48px] min-w-[48px] p-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="重置計時"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setRunning(r => !r)}
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-300 font-medium hover:bg-primary-500/30 transition-colors flex items-center gap-2"
        >
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {running ? '暫停' : '開始'}
        </button>
      </div>

      <p className="text-center text-white/40 text-xs mt-4">
        番茄鐘：25 分鐘專注 + 5 分鐘休息，循環進行
      </p>
    </div>
  )
}

export default function LearnStudyBuddyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          返回課程總覽
        </Link>

        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Users className="w-7 h-7 text-primary-400" />
          學習夥伴 & 專注模式
        </h1>
        <p className="text-white/60 text-sm mb-8">
          番茄鐘專注閱讀，並與同路人互相激勵。
        </p>

        {/* LEARN-045: 番茄鐘計時器 */}
        <div className="mb-8">
          <PomodoroTimer />
        </div>

        {/* Status Banner */}
        <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">夥伴配對功能開發中</p>
              <p className="text-xs text-white/50">預計 2026 Q2 上線</p>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          配對功能預覽
        </h2>
        <div className="space-y-3 mb-8">
          {PREVIEW_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="p-2 rounded-lg bg-primary-500/20 shrink-0">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white/90">{feat.title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{feat.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
          <Users className="w-10 h-10 text-primary-400/40 mx-auto mb-3" />
          <p className="text-white/70 mb-1">先完成幾堂課程，配對時更精準</p>
          <p className="text-white/40 text-sm mb-4">
            完成 3 堂課程後，將優先開放配對資格
          </p>
          <Link
            href="/learn"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-500/30 text-primary-300 text-sm font-medium hover:bg-primary-500/40 transition-colors"
          >
            開始學習
          </Link>
        </div>
      </div>
    </div>
  )
}
