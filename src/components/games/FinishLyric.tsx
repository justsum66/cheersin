'use client'
import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const LYRICS = [
  { lyrics: '月亮代表我的心', song: '月亮代表我的心' },
  { lyrics: '愛我別走', song: '愛我別走' },
  { lyrics: '你知道我在等你嗎', song: '聽海' },
  { lyrics: '如果雲知道', song: '如果雲知道' },
  { lyrics: '我是一隻小小鳥', song: '我是一隻小小鳥' },
  { lyrics: '想見你', song: '想見你' },
  { lyrics: '披星戴月的想你', song: '晴天' },
  { lyrics: '情非得已', song: '情非得已' },
  { lyrics: '把愛剪碎了', song: '剪愛' },
  { lyrics: '我願意為你', song: '我願意' },
]

export default function FinishLyric() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState<typeof LYRICS[0] | null>(null)
  const [guess, setGuess] = useState('')
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'result'>('waiting')

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const lyric = LYRICS[Math.floor(Math.random() * LYRICS.length)]
    setCurrent(lyric)
    setGuess('')
    setPhase('playing')
    play('click')
  }, [play])

  const submitGuess = () => {
    if (!current) return
    const correct = guess.toLowerCase().includes(current.song.toLowerCase()) || current.song.toLowerCase().includes(guess.toLowerCase())
    if (correct) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 1 }))
      play('correct')
    } else {
      play('wrong')
    }
    setPhase('result')
  }

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('waiting')
  }

  const resetGame = () => {
    setRound(1)
    setScores({})
    setPhase('waiting')
  }

  const resultText = players.map(p => `${p}: ${scores[p] || 0}分`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="看歌詞猜歌名！猜錯喝酒！" rulesKey="finish-lyric.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <m.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">{t('common.turnLabel', { n: round })}</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <div className="text-6xl">🎵</div>
            <button onClick={startRound} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">開始挑戰</button>
          </m.div>
        )}

        {phase === 'playing' && current && (
          <m.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <div className="text-6xl">🎤</div>
            <div className="text-white/60">這是哪首歌？</div>
            <div className="text-3xl text-accent-400 font-bold text-center p-6 bg-white/10 rounded-2xl">「{current.lyrics}」</div>
            <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="輸入歌名..." className="w-full max-w-md px-4 py-3 rounded-xl bg-white/10 text-white text-center text-xl border border-white/20 focus:border-primary-400 outline-none" autoFocus />
            <button onClick={submitGuess} disabled={!guess} className="px-8 py-4 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 rounded-2xl text-white font-bold text-xl transition-colors">確認答案</button>
          </m.div>
        )}

        {phase === 'result' && current && (
          <m.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-4">
            <div className={`text-3xl font-bold ${guess.toLowerCase().includes(current.song.toLowerCase()) || current.song.toLowerCase().includes(guess.toLowerCase()) ? 'text-green-400' : 'text-red-400'}`}>
              {guess.toLowerCase().includes(current.song.toLowerCase()) || current.song.toLowerCase().includes(guess.toLowerCase()) ? '答對了！' : '答錯了！喝一口！'}
            </div>
            {!guess.toLowerCase().includes(current.song.toLowerCase()) && !current.song.toLowerCase().includes(guess.toLowerCase()) && !reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
            <div className="text-white/60">正確歌名：{current.song}</div>
            <div className="text-white mt-4">{players.map(p => <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>)}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={nextRound} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors">下一回合</button>
              <button onClick={resetGame} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">重新開始</button>
            </div>
            <CopyResultButton text={`接歌詞 ${resultText}`} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
