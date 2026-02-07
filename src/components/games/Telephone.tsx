'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, RotateCcw, Volume2 } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const TELEPHONE_MESSAGES = [
  '今天天氣真好適合喝酒',
  '我最喜歡的酒是威士忌',
  '大家一起乾杯慶祝這個美好的夜晚',
  '喝酒不要開車安全第一',
  '朋友聚會就是要盡興',
  '微醺的感覺最棒了',
  '下次我們去唱KTV吧',
  '這款雞尾酒真的很好喝',
  '酒後吐真言說出心裡話',
  '大家一起玩遊戲最開心',
  '喝酒要適量不要過量',
  '今晚的遊戲太有趣了',
  '我們應該經常聚聚',
  '酒逢知己千杯少',
  '人生得意須盡歡',
  '把酒言歡話當年',
  '舉杯邀明月對影成三人',
  '醉翁之意不在酒',
  '酒不醉人人自醉',
  '今朝有酒今朝醉'
]

export default function Telephone() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [originalMessage, setOriginalMessage] = useState('')
  const [messages, setMessages] = useState<string[]>(Array(players.length).fill(''))
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [gameResults, setGameResults] = useState<string[]>([])

  const currentPlayer = players[currentPlayerIndex]
  const nextPlayer = players[(currentPlayerIndex + 1) % players.length]

  useEffect(() => {
    if (gameState === 'playing' && isSpeaking) {
      const timer = setTimeout(() => {
        setIsSpeaking(false)
        if (currentPlayerIndex < players.length - 1) {
          setCurrentPlayerIndex(prev => prev + 1)
        } else {
          setGameState('results')
          play('win')
          generateResults()
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [gameState, isSpeaking, currentPlayerIndex, players.length, play])

  const startGame = () => {
    const randomMessage = TELEPHONE_MESSAGES[Math.floor(Math.random() * TELEPHONE_MESSAGES.length)]
    setOriginalMessage(randomMessage)
    setMessages(Array(players.length).fill(''))
    setCurrentPlayerIndex(0)
    setGameState('playing')
    play('click')
  }

  const speakMessage = () => {
    setIsSpeaking(true)
    play('click')
    
    // For the first player, show the original message
    if (currentPlayerIndex === 0) {
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[0] = originalMessage
        return newMessages
      })
    }
  }

  const generateResults = () => {
    const results = [
      `傳話遊戲結果：`,
      `原始訊息：${originalMessage}`,
      `最終訊息：${messages[messages.length - 1]}`,
      `傳遞輪數：${players.length}輪`,
      `訊息變化程度：${calculateMessageChange(originalMessage, messages[messages.length - 1])}%`
    ]
    setGameResults(results)
  }

  const calculateMessageChange = (original: string, final: string): number => {
    // Simple similarity calculation
    const originalWords = original.split('')
    const finalWords = final.split('')
    let matches = 0
    
    for (let i = 0; i < Math.min(originalWords.length, finalWords.length); i++) {
      if (originalWords[i] === finalWords[i]) {
        matches++
      }
    }
    
    return Math.round(100 - (matches / Math.max(originalWords.length, finalWords.length)) * 100)
  }

  const resetGame = () => {
    setGameState('setup')
    setCurrentPlayerIndex(0)
    setOriginalMessage('')
    setMessages(Array(players.length).fill(''))
    setGameResults([])
    setIsSpeaking(false)
    play('click')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        <motion.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          傳話遊戲
        </motion.h1>
        <p className="text-white/80 mb-8">悄悄話傳遞，看看訊息會變成什麼樣子！</p>

        <GameRules 
          rules="遊戲規則：
1. 系統給出一個原始訊息
2. 第一位玩家看訊息後，悄悄告訴下一位玩家
3. 每位玩家只能聽一次，然後傳給下一位
4. 最後一位玩家說出他聽到的訊息
5. 比較原始訊息和最終訊息的差異
6. 變化越大越有趣！"
        />

        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <MessageCircle className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              <h2 className="text-2xl font-bold mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">點擊下方按鈕開始傳話遊戲</p>
              <button
                onClick={startGame}
                className="games-touch-target px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                開始遊戲
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.9, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left">
                    <p className="text-sm text-white/60">目前玩家</p>
                    <p className="text-xl font-bold text-purple-400">{currentPlayer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">下一位</p>
                    <p className="text-xl font-bold text-pink-400">{nextPlayer}</p>
                  </div>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-white/80">
                  第 {currentPlayerIndex + 1} / {players.length} 輪
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-6 mb-6 min-h-[120px] flex items-center justify-center">
                {isSpeaking ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-center"
                  >
                    <Volume2 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <p className="text-lg font-bold">正在傳話中...</p>
                    <p className="text-white/60">請其他玩家不要偷看</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    {currentPlayerIndex === 0 ? (
                      <>
                        <p className="text-lg mb-4">請記住以下訊息：</p>
                        <p className="text-2xl font-bold text-purple-400 bg-white/10 rounded-lg p-4">
                          {originalMessage}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg mb-4">你聽到的訊息是：</p>
                        <p className="text-2xl font-bold text-pink-400 bg-white/10 rounded-lg p-4">
                          {messages[currentPlayerIndex - 1] || '...'}
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {!isSpeaking && (
                <button
                  onClick={speakMessage}
                  disabled={isSpeaking}
                  className="games-touch-target w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5 inline mr-2" />
                  {currentPlayerIndex === 0 ? '開始傳話' : '傳給下一位'}
                </button>
              )}
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                遊戲結果
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/60">原始訊息</p>
                  <p className="text-lg font-bold text-purple-400">{originalMessage}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/60">最終訊息</p>
                  <p className="text-lg font-bold text-pink-400">{messages[messages.length - 1]}</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4">
                  <p className="text-sm text-white/60">訊息變化程度</p>
                  <p className="text-2xl font-bold">
                    {calculateMessageChange(originalMessage, messages[messages.length - 1])}%
                  </p>
                  <p className="text-sm text-white/80">
                    {calculateMessageChange(originalMessage, messages[messages.length - 1]) > 50 
                      ? '變化很大！傳話失敗 😅' 
                      : '變化不大！傳話成功 👍'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CopyResultButton 
                  text={gameResults.join('\n')} 
                  label="複製結果"
                  className="flex-1 games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
                />
                <button
                  onClick={resetGame}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  再玩一次
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}