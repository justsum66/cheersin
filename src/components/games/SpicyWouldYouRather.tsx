'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, RotateCcw, AlertTriangle } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

const SPICY_WYR = [
  { a: '和前任復合', b: '永遠單身' },
  { a: '讓所有人看到你的瀏覽記錄', b: '讓所有人看到你的聊天記錄' },
  { a: '和暗戀對象共處一室', b: '和討厭的人共處一室' },
  { a: '裸睡被撞見', b: '說夢話被錄下來' },
  { a: '告白被拒絕', b: '錯過真愛' },
  { a: '在眾人面前放屁', b: '在暗戀對象面前摔倒' },
  { a: '被發現偷看別人手機', b: '被發現偷聽別人對話' },
  { a: '在公司群發錯曖昧訊息', b: '在家族群發錯色色圖片' },
  { a: '接吻技術被嫌棄', b: '床上表現被嫌棄' },
  { a: '和朋友的前任約會', b: '和前任的朋友約會' },
  { a: '酒後真言說出秘密', b: '清醒時不小心說出秘密' },
  { a: '被偷拍親密照', b: '不小心傳錯親密照' },
  { a: '在電梯裡響屁', b: '在會議中響屁' },
  { a: '被發現假高潮', b: '被發現假哭' },
  { a: '和陌生人一見鍾情', b: '和朋友日久生情' },
  { a: '說出最羞恥的幻想', b: '表演最尷尬的才藝' },
  { a: '讓現任看到和前任的親密照', b: '讓現任聽到你誇前任' },
  { a: '在公共場合被求婚', b: '在公共場合被分手' },
  { a: '酒後亂性', b: '酒後失態大哭' },
  { a: '和認識的人約會', b: '和網友約會' },
]

/** G2.13-G2.14：辣味終極二選一 - 18+ 成人版你會選哪個 */
export default function SpicyWouldYouRather() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [ageVerified, setAgeVerified] = useState(false)
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [currentQ, setCurrentQ] = useState<typeof SPICY_WYR[0] | null>(null)
  const [usedQs, setUsedQs] = useState<Set<number>>(new Set())
  const [choice, setChoice] = useState<'a' | 'b' | null>(null)

  const currentPlayer = players[currentPlayerIdx]

  const getNextQ = useCallback(() => {
    const available = SPICY_WYR.map((_, i) => i).filter(i => !usedQs.has(i))
    if (available.length === 0) {
      setUsedQs(new Set())
      return SPICY_WYR[Math.floor(Math.random() * SPICY_WYR.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedQs(prev => new Set([...prev, idx]))
    return SPICY_WYR[idx]
  }, [usedQs])

  const startRound = useCallback(() => {
    play('click')
    setCurrentQ(getNextQ())
    setChoice(null)
  }, [getNextQ, play])

  const makeChoice = useCallback((c: 'a' | 'b') => {
    play('correct')
    setChoice(c)
  }, [play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    startRound()
  }, [currentPlayerIdx, players.length, startRound])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setCurrentQ(null)
    setUsedQs(new Set())
    setChoice(null)
  }, [])

  if (!ageVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">🔞 18+ 限制級內容</h2>
        <p className="text-white/60 text-center mb-6">此遊戲包含成人主題內容<br />請確認您已年滿 18 歲</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setAgeVerified(true)}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold games-focus-ring"
        >
          我已年滿 18 歲，進入遊戲
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`🔞 辣味二選一！\n必須選一個，不能跳過！\n拒絕回答就喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-white">辣味終極二選一</h2>
      </div>

      {!currentQ ? (
        <motion.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xl games-focus-ring">
          開始辣味挑戰！
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-white/70"><span className="text-red-400 font-bold">{currentPlayer}</span> 的回合</p>
          
          <p className="text-white/50 text-center mb-2">你寧願...</p>

          <div className="flex flex-col gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => makeChoice('a')}
              className={`w-full p-4 rounded-xl text-left transition-all ${choice === 'a' ? 'bg-red-500 text-white' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
            >
              <span className="text-lg">{currentQ.a}</span>
            </motion.button>
            
            <p className="text-white/30 text-center">還是</p>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => makeChoice('b')}
              className={`w-full p-4 rounded-xl text-left transition-all ${choice === 'b' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
            >
              <span className="text-lg">{currentQ.b}</span>
            </motion.button>
          </div>

          {choice && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-3 mt-4">
              <button onClick={nextPlayer} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一位</button>
              <CopyResultButton text={`辣味二選一：${currentPlayer} 選了「${choice === 'a' ? currentQ.a : currentQ.b}」`} />
            </motion.div>
          )}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
