import { useState, useRef, useEffect } from 'react'
import { Crown, GripVertical, RotateCcw, UserPlus, Users, X } from 'lucide-react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import { RANDOM_NICKNAMES } from '@/config/games.config'
import { useGameReduceMotion } from './GameWrapper'

export interface RoomPlayer {
    id: string
    displayName: string
    isHost?: boolean
    playerColor?: string
    isSpectator?: boolean
}

interface PlayerManagementModalProps {
    isOpen: boolean
    onClose: () => void
    isInRoomMode: boolean
    players: string[]
    roomPlayers: RoomPlayer[]
    maxPlayers: number
    onAddPlayer: (name: string) => void
    onRemovePlayer: (index: number) => void
    onReorderPlayers: (from: number, to: number) => void
    onLoadLastSaved: () => void
    tier: string
}

export function PlayerManagementModal({
    isOpen,
    onClose,
    isInRoomMode,
    players,
    roomPlayers,
    maxPlayers,
    onAddPlayer,
    onRemovePlayer,
    onReorderPlayers,
    onLoadLastSaved,
    tier
}: PlayerManagementModalProps) {
    const reducedMotion = useGameReduceMotion()
    const [newPlayerName, setNewPlayerName] = useState('')
    const [addPlayerError, setAddPlayerError] = useState<string | null>(null)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setNewPlayerName('')
            setAddPlayerError(null)
        }
    }, [isOpen])

    const sanitizePlayerName = (raw: string) => raw.replace(/[\s\u200B-\u200D\uFEFF]+/g, ' ').replace(/[<>\"'&]/g, '').trim()

    const handleAdd = () => {
        const name = sanitizePlayerName(newPlayerName)
        setAddPlayerError(null)
        if (!name) return
        if (players.includes(name)) {
            setAddPlayerError('此暱稱已存在，請換一個')
            return
        }
        if (players.length >= maxPlayers) return
        onAddPlayer(name)
        setNewPlayerName('')
    }

    if (!isOpen) return null

    return (
        <m.div
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <m.div
                initial={reducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
                transition={reducedMotion ? { duration: 0 } : undefined}
                className="bg-[#0a0a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="player-modal-title"
                aria-label="管理玩家名單"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 id="player-modal-title" className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary-400" />
                        玩家列表
                    </h2>
                    <ModalCloseButton onClick={onClose} aria-label="關閉" className="rounded-full text-white/70" />
                </div>

                {!isInRoomMode && (
                    <>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="flex gap-2 mb-2">
                            <label htmlFor="new-player-name" className="sr-only">輸入玩家暱稱（最多 20 字）</label>
                            <input
                                id="new-player-name"
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => { setNewPlayerName(e.target.value); setAddPlayerError(null); }}
                                placeholder="輸入玩家暱稱..."
                                maxLength={20}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-primary-500 transition-colors"
                                aria-invalid={!!addPlayerError}
                                aria-describedby={addPlayerError ? 'add-player-error' : undefined}
                            />
                            <button type="submit" disabled={players.length >= maxPlayers} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors" title={players.length >= maxPlayers ? `已達人數上限（${maxPlayers} 人），升級可開更多人` : '新增玩家'}>
                                新增
                            </button>
                        </form>
                        {addPlayerError && <p id="add-player-error" className="text-red-400 text-sm mb-2" role="alert">{addPlayerError}</p>}
                        {players.length >= maxPlayers && <p className="text-amber-400/90 text-xs mb-2">已達人數上限（{maxPlayers} 人）</p>}
                        <p className="mb-4">
                            <button
                                type="button"
                                onClick={() => setNewPlayerName(RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)] ?? '')}
                                className="text-xs text-primary-400 hover:text-primary-300 hover:underline"
                                aria-label="隨機產生暱稱"
                            >
                                隨機暱稱
                            </button>
                        </p>
                        <p className="text-white/40 text-xs mb-4">
                            最多 {maxPlayers} 人（依方案：Free 4 / Basic 8 / Pro 12），用於命運轉盤等遊戲
                            {players.length >= maxPlayers && maxPlayers < 12 && (
                                <Link href="/pricing" className="ml-2 text-primary-400 hover:underline">升級可開更多人數</Link>
                            )}
                        </p>
                    </>
                )}
                {isInRoomMode && (
                    <p className="text-white/40 text-xs mb-4">房間名單（會自動同步）</p>
                )}

                {/* GAMES_500 #172：玩家列表空狀態「新增玩家」CTA 明顯 */}
                {!isInRoomMode && players.length === 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-white/60 text-sm">在下方輸入暱稱後按「新增」加入名單</p>
                        <button
                            type="button"
                            onClick={onLoadLastSaved}
                            className="w-full min-h-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/15 flex items-center justify-center gap-2 text-sm"
                        >
                            <RotateCcw className="w-4 h-4" />
                            載入上次名單
                        </button>
                    </div>
                )}
                {/* Player List；P1-117：房主標識（皇冠） */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.length === 0 ? (
                        <p className="text-white/30 text-center py-8">尚未新增任何玩家</p>
                    ) : (
                        isInRoomMode
                            ? roomPlayers.map((p, i) => (
                                <div key={p.id ?? i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 gap-2">
                                    <span className="flex items-center gap-2 text-white font-medium truncate min-w-0">
                                        {p.isHost && <Crown className="w-4 h-4 shrink-0 text-secondary-400" aria-label="房主" />}
                                        {/* P1-124：玩家辨識色 — 圓點頭像 */}
                                        {p.playerColor && (
                                            <span
                                                className="w-3 h-3 shrink-0 rounded-full"
                                                style={{ backgroundColor: p.playerColor }}
                                                aria-hidden
                                            />
                                        )}
                                        <span title={p.displayName} style={p.playerColor ? { color: p.playerColor } : undefined}>{p.displayName}</span>
                                    </span>
                                </div>
                            ))
                            : players.map((player, i) => (
                                <div
                                    key={i}
                                    draggable
                                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move' }}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
                                        if (!Number.isNaN(from) && from !== i) onReorderPlayers(from, i)
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 gap-2 cursor-grab active:cursor-grabbing hover:bg-white/[0.07] transition-colors group"
                                    role="listitem"
                                    aria-label={`玩家 ${player}，可拖拽排序`}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <GripVertical className="w-4 h-4 shrink-0 text-white/40 group-hover:text-white/60" aria-hidden />
                                        <span className="text-white font-medium truncate" title={player}>{player}</span>
                                    </span>
                                    <button
                                        onClick={() => onRemovePlayer(i)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center"
                                        aria-label={`移除 ${player}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                    )}
                </div>

            </m.div>
        </m.div>
    )
}
