'use client'

import { m } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import type { GameMode } from '@/config/games.config'
import { Badge } from '@/components/ui/Badge'
import { useGameReduceMotion } from './GameWrapper'

interface GameModeSelectorProps {
    modes: GameMode[]
    onSelect: (modeId: string) => void
    onCancel: () => void
    title?: string
}

export function GameModeSelector({ modes, onSelect, onCancel, title }: GameModeSelectorProps) {
    const reducedMotion = useGameReduceMotion()
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="game-mode-selector-title">
            <m.div
                className="w-full max-w-lg p-6 space-y-6 rounded-2xl bg-card/50 border border-white/10 shadow-2xl backdrop-blur-md"
                variants={containerVariants}
                initial={reducedMotion ? false : "hidden"}
                animate="visible"
            >
                <div className="space-y-2 text-center">
                    <h2 id="game-mode-selector-title" className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        {title || '選擇遊戲模式'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        請選擇您想遊玩的模式
                    </p>
                </div>

                <div className="grid gap-4">
                    {modes.map((mode) => (
                        <m.button
                            key={mode.id}
                            variants={reducedMotion ? undefined : itemVariants}
                            onClick={() => onSelect(mode.id)}
                            className={`relative flex items-center p-4 transition-all duration-300 border rounded-xl group text-left w-full
                hover:scale-[1.02] active:scale-[0.98] outline-none focus:ring-2 focus:ring-primary/50
                ${mode.isPremium
                                    ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50'
                                }`}
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-lg ${mode.isPremium ? 'text-amber-500' : 'text-white'}`}>
                                        {mode.label}
                                    </span>
                                    {mode.isPremium && (
                                        <Badge variant="warning" size="sm">
                                            Premium
                                        </Badge>
                                    )}
                                </div>
                                {mode.description && (
                                    <p className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                                        {mode.description}
                                    </p>
                                )}
                            </div>

                            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {mode.isPremium ? <Lock className="w-5 h-5 text-amber-500" /> : <Check className="w-5 h-5 text-primary" />}
                            </div>
                        </m.button>
                    ))}
                </div>

                <div className="flex justify-center pt-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 min-h-[44px] text-sm font-medium text-muted-foreground hover:text-white transition-colors games-focus-ring rounded-lg"
                        aria-label="返回上一頁"
                    >
                        返回
                    </button>
                </div>
            </m.div>
        </div>
    )
}
