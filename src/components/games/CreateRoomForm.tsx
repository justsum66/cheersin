import Link from 'next/link'
import { Eye, EyeOff, Crown } from 'lucide-react'
import { useState } from 'react'

interface CreateRoomFormProps {
    isInRoomMode: boolean
    activeGameId: string | null
    password: string
    setPassword: (val: string) => void
    isAnonymous: boolean
    setIsAnonymous: (val: boolean) => void
    isCreating: boolean
    onCreate: () => void
    error: string | null
    currentPlayersCount: number
    maxPlayers: number
    onLeaveRoom?: () => void
}

export function CreateRoomForm({
    isInRoomMode,
    activeGameId,
    password,
    setPassword,
    isAnonymous,
    setIsAnonymous,
    isCreating,
    onCreate,
    error,
    currentPlayersCount,
    maxPlayers,
    onLeaveRoom
}: CreateRoomFormProps) {
    const [showPassword, setShowPassword] = useState(false)

    // Calcluate step for UI (1: Password, 2: Invite, 3: Game)
    const step = !isInRoomMode ? 1 : (activeGameId ? 3 : 2)

    return (
        <div className="flex flex-col gap-2 items-center p-4 rounded-xl border border-primary-500/20 bg-primary-500/5 min-w-[200px]" role="group" aria-label="建立房間">
            {/* P1-110：創建房間三步引導 — 設置密碼 → 邀請好友 → 選擇遊戲；依狀態高亮當前步驟 */}
            <div className="flex items-center gap-1 mb-2 text-xs" role="list" aria-label="建立房間流程">
                <span className={`flex items-center gap-1 ${step >= 1 ? 'text-primary-400' : 'text-white/40'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>1</span>
                    <span>設密碼</span>
                </span>
                <span className="w-3 h-px bg-white/20" aria-hidden />
                <span className={`flex items-center gap-1 ${step >= 2 ? 'text-primary-400' : 'text-white/40'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>2</span>
                    <span>邀請好友</span>
                </span>
                <span className="w-3 h-px bg-white/20" aria-hidden />
                <span className={`flex items-center gap-1 ${step >= 3 ? 'text-primary-400' : 'text-white/40'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>3</span>
                    <span>選擇遊戲</span>
                </span>
            </div>
            <span className="text-sm font-semibold text-primary-300">建立房間</span>
            <div className="relative flex items-center w-full max-w-[200px]">
                <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4 位數密碼（選填）"
                    maxLength={4}
                    aria-label="建立房間密碼（選填）"
                    className="w-full min-h-[48px] bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white placeholder-white/30 text-sm"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/10 games-touch-target"
                    aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {password.length === 4 && (
                <p className="text-white/50 text-xs" role="status" aria-label="密碼強度">
                    {/^(\d)\1{3}$/.test(password) ? '強度：弱（建議避免同一數字）' : /^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/.test(password) ? '強度：中（連續數字）' : '強度：佳'}
                </p>
            )}
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer min-h-[48px]">
                <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-white/30 bg-white/10 text-primary-500"
                    aria-label="建立時開啟匿名模式（玩家顯示為玩家A/B）"
                />
                <span>匿名模式（玩家A/B）</span>
            </label>
            <button
                onClick={onCreate}
                disabled={isCreating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 border border-primary-500/50 text-white font-semibold min-h-[48px] min-w-[48px] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
            >
                {isCreating ? '建立中…' : '建立房間'}
            </button>
            {error && (
                <div className="mt-2 space-y-1">
                    <p className="text-red-400 text-sm" role="alert">{error}</p>
                    <Link href="/pricing" className="text-primary-400 hover:text-primary-300 text-xs font-medium underline underline-offset-1">
                        升級方案可開更多人
                    </Link>
                </div>
            )}
            {!isInRoomMode && currentPlayersCount >= maxPlayers && maxPlayers < 12 && (
                <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                    <p className="text-amber-300 text-sm font-medium mb-1">已達免費人數上限（{maxPlayers} 人）</p>
                    <p className="text-white/60 text-xs mb-2">升級 Pro 可開 12 人大房間</p>
                    <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity min-h-[44px]">
                        <Crown className="w-4 h-4" aria-hidden />
                        升級解鎖 12 人房間
                    </Link>
                </div>
            )}
            {isInRoomMode && onLeaveRoom && (
                <button
                    type="button"
                    onClick={onLeaveRoom}
                    className="min-h-[48px] px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm"
                    aria-label="離開房間（會清除本機加入狀態）"
                >
                    離開房間
                </button>
            )}
        </div>
    )
}
