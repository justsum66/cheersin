'use client'

import { useState, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { CustomGame, CustomGameCard } from '@/lib/custom-games'
import { buttonHover, buttonTap, slideUp, scaleIn } from '@/lib/animations'
import { ChevronRight, RotateCcw, Shuffle, Trophy, Share2, BookmarkPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { useGameReduceMotion } from './GameWrapper'

interface CustomGamePlayerProps {
    game: CustomGame
    onExit: () => void
}

/** GAME-100: Saved games list — persist played games to localStorage */
const SAVED_GAMES_KEY = 'cheersin_custom_saved_games'
function getSavedGames(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_GAMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
function saveGameId(id: string) {
  try {
    const list = getSavedGames()
    if (!list.includes(id)) {
      list.unshift(id)
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(list.slice(0, 50)))
    }
  } catch { /* noop */ }
}

export default function CustomGamePlayer({ game, onExit }: CustomGamePlayerProps) {
    const reducedMotion = useGameReduceMotion()
    const [deck, setDeck] = useState<CustomGameCard[]>([])
    const [currentCard, setCurrentCard] = useState<CustomGameCard | null>(null)
    const [isFinished, setIsFinished] = useState(false)
    /** GAME-100: Track saved state */
    const [isSaved, setIsSaved] = useState(false)

    const restartGame = useCallback(() => {
        const shuffled = [...game.content].sort(() => Math.random() - 0.5)
        setDeck(shuffled)
        setCurrentCard(null)
        setIsFinished(false)
    }, [game.content])

    // Initialize and Shuffle
    useEffect(() => {
        restartGame()
    }, [game, restartGame])

    /** GAME-100: Check if already saved on mount */
    useEffect(() => {
        if (game.id) {
            setIsSaved(getSavedGames().includes(game.id))
        }
    }, [game.id])

    const nextCard = () => {
        if (deck.length === 0) {
            setIsFinished(true)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
            return
        }

        const [next, ...remaining] = deck
        setCurrentCard(next)
        setDeck(remaining)
    }

    /** GAME-099: Share game template via Web Share API */
    const shareGame = async () => {
        const shareData = {
            title: game.name,
            text: `來玩「${game.name}」！${game.description}`,
            url: typeof window !== 'undefined' ? window.location.href : '',
        }
        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
            }
        } catch { /* user cancelled */ }
    }

    /** GAME-100: Save game to local list */
    const handleSave = () => {
        if (game.id) {
            saveGameId(game.id)
            setIsSaved(true)
        }
    }

    // Initial View
    if (!currentCard && !isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center p-6">
                <m.div
                    initial={reducedMotion ? false : "hidden"}
                    animate="visible"
                    variants={scaleIn}
                    className="mb-8 p-6 rounded-full bg-primary-500/20"
                >
                    <Trophy className="w-16 h-16 text-primary-400" />
                </m.div>

                <h2 className="text-3xl font-display font-bold text-white mb-4">{game.name}</h2>
                <p className="text-white/60 mb-8">{game.description}</p>

                <div className="flex flex-col gap-3 w-full">
                    <m.button
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        onClick={nextCard}
                        className="btn-primary py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary-500/20"
                    >
                        Start Game
                    </m.button>
                    {/** GAME-099: Share button */}
                    <div className="flex gap-2 justify-center">
                        <button onClick={shareGame} className="flex items-center gap-1 text-white/40 hover:text-white py-2 text-sm">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        {/** GAME-100: Save/Bookmark button */}
                        <button onClick={handleSave} disabled={isSaved} className="flex items-center gap-1 text-white/40 hover:text-white py-2 text-sm disabled:text-primary-400">
                            <BookmarkPlus className="w-4 h-4" /> {isSaved ? 'Saved' : 'Save'}
                        </button>
                    </div>
                    <button onClick={onExit} className="text-white/40 hover:text-white py-2 text-sm">
                        Exit
                    </button>
                </div>
            </div>
        )
    }

    // Finished View
    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center p-6">
                <h2 className="text-3xl font-display font-bold text-white mb-4">Game Over!</h2>
                <p className="text-white/60 mb-8">You&apos;ve gone through all the cards.</p>

                <div className="flex flex-col gap-3 w-full">
                    <m.button
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        onClick={restartGame}
                        className="btn-secondary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" /> Play Again
                    </m.button>
                    <button onClick={onExit} className="text-white/40 hover:text-white py-2 text-sm">
                        Back to Menu
                    </button>
                </div>
            </div>
        )
    }

    // Card View
    return (
        <div className="flex flex-col h-full max-w-md mx-auto relative cursor-pointer" onClick={nextCard}>
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${((game.content.length - deck.length) / game.content.length) * 100}%` }}
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <m.div
                        key={currentCard!.id}
                        initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 1.1, rotate: 5 }}
                        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                            "w-full aspect-[3/4] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl border border-white/10 relative overflow-hidden",
                            currentCard!.type === 'truth' && "bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/30",
                            currentCard!.type === 'dare' && "bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30",
                            currentCard!.type === 'plain' && "bg-gradient-to-br from-white/10 to-white/5"
                        )}
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        {/* Type Badge */}
                        {currentCard!.type !== 'plain' && (
                            <div className="mb-6">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                                    currentCard!.type === 'truth' && "bg-pink-500/20 text-pink-300",
                                    currentCard!.type === 'dare' && "bg-orange-500/20 text-orange-300"
                                )}>
                                    {currentCard!.type}
                                </span>
                            </div>
                        )}

                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {currentCard!.text}
                        </h3>

                        <div className="mt-8 text-white/30 text-sm">
                            Tap to continue
                        </div>
                    </m.div>
                </AnimatePresence>
            </div>

            <div className="p-6">
                <p className="text-center text-white/30 text-xs">
                    {game.content.length - deck.length} / {game.content.length}
                </p>
            </div>
        </div>
    )
}
