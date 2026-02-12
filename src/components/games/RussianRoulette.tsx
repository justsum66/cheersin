'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, RotateCcw, Skull } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

/** G2.5-G2.6：俄羅斯輪盤 - 經典六選一 */
export default function RussianRoulette() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const defaultPlayers = [1, 2, 3, 4].map((n) => t('games.playerN', { n }))
  const players = contextPlayers.length >= 2 ? contextPlayers : defaultPlayers

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [bulletPos, setBulletPos] = useState(-1)
  const [currentPos, setCurrentPos] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [fired, setFired] = useState(false)
  const [result, setResult] = useState<'boom' | 'safe' | null>(null)
  const [history, setHistory] = useState<Array<{ player: string; result: 'boom' | 'safe' }>>([])

  const currentPlayer = players[currentPlayerIdx]

  const startGame = useCallback(() => {
    play('click')
    setBulletPos(Math.floor(Math.random() * 6))
    setCurrentPos(0)
    setFired(false)
    setResult(null)
  }, [play])

  const pullTrigger = useCallback(() => {
    if (spinning || fired) return
    play('click')
    setSpinning(true)
    
    setTimeout(() => {
      setSpinning(false)
      setFired(true)
      const hit = currentPos === bulletPos
      if (hit) {
        play('wrong')
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        setResult('boom')
      } else {
        play('correct')
        setResult('safe')
      }
      setHistory(prev => [...prev, { player: currentPlayer, result: hit ? 'boom' : 'safe' }])
    }, 500)
  }, [spinning, fired, currentPos, bulletPos, currentPlayer, play])

  const nextPlayer = useCallback(() => {
    if (result === 'boom') {
      // Reset for new round
      setBulletPos(Math.floor(Math.random() * 6))
      setCurrentPos(0)
    } else {
      setCurrentPos((currentPos + 1) % 6)
    }
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setFired(false)
    setResult(null)
  }, [currentPlayerIdx, currentPos, players.length, result])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setBulletPos(-1)
    setCurrentPos(0)
    setSpinning(false)
    setFired(false)
    setResult(null)
    setHistory([])
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={t('games.russianRouletteRules')} />
      
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-white">{t('games.russianRouletteTitle')}</h2>
      </div>

      {bulletPos < 0 ? (
        <motion.button whileTap={{ scale: 0.96 }} onClick={startGame} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xl games-focus-ring">
          {t('games.russianRouletteLoadBullet')}
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-white/70">{t('games.russianRouletteTurn')} <span className="text-red-400 font-bold">{currentPlayer}</span></p>
          
          {/* Revolver cylinder visualization */}
          <div className="relative w-40 h-40">
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-white/30"
              animate={spinning ? { rotate: 360 } : {}}
              transition={{ duration: 0.5 }}
            >
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`absolute w-6 h-6 rounded-full ${i === currentPos ? 'ring-2 ring-yellow-400' : ''} ${history.some(h => h.result === 'boom') && i === bulletPos ? 'bg-red-500' : 'bg-white/20'}`}
                  style={{
                    top: `${50 - 35 * Math.cos((i * 60 - 90) * Math.PI / 180)}%`,
                    left: `${50 + 35 * Math.sin((i * 60 - 90) * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/50 text-sm">{t('common.shotProgress', { current: currentPos + 1 })}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result === null ? (
              <motion.button
                key="trigger"
                whileTap={{ scale: 0.96 }}
                onClick={pullTrigger}
                disabled={spinning}
                className="px-8 py-4 rounded-xl bg-red-500 text-white font-bold text-lg games-focus-ring disabled:opacity-50"
              >
                {spinning ? '...' : t('games.russianRouletteTrigger')}
              </motion.button>
            ) : (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                {result === 'boom' ? (
                  <>
                    <Skull className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
                    <p className="text-red-400 font-bold text-2xl mt-2">{t('games.russianRouletteHit')}{currentPlayer} {t('games.russianRouletteDrink')}</p>
                  </>
                ) : (
                  <p className="text-emerald-400 font-bold text-2xl">{t('games.russianRouletteSafe')}</p>
                )}
                <div className="flex gap-3 mt-4 justify-center">
                  <button onClick={nextPlayer} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">
                    {result === 'boom' ? t('games.russianRouletteNextRound') : t('games.russianRouletteNextPlayer')}
                  </button>
                  <CopyResultButton text={`${t('games.russianRouletteTitle')}：${currentPlayer} ${result === 'boom' ? t('games.russianRouletteHit') + currentPlayer + ' ' + t('games.russianRouletteDrink') : t('games.russianRouletteSafe')}`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {history.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs max-h-32 overflow-auto">
          {history.slice(-5).map((h, i) => (
            <div key={i}>{h.player}: {h.result === 'boom' ? '💀' : '✓'}</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
