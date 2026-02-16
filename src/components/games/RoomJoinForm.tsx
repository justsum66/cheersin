import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { RANDOM_NICKNAMES } from '@/config/games.config'

// Moved from GamesPageClient 
// const RANDOM_NICKNAMES = ... (removed)

interface RoomJoinFormProps {
    roomFull: boolean
    currentPlayersCount: number
    maxPlayers: number
    onJoin: (name: string, password?: string) => void
    onJoinSpectator: (name: string, password?: string) => void
    error: string | null
    setError: (err: string | null) => void // Allow clearing error on input
    t: (key: string) => string
}

export function RoomJoinForm({
    roomFull,
    currentPlayersCount,
    maxPlayers,
    onJoin,
    onJoinSpectator,
    error,
    setError,
    t
}: RoomJoinFormProps) {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onJoin(name.trim(), password || undefined)
    }

    return (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto" role="region" aria-label="加入房間">
            <h3 className="text-base font-semibold text-white mb-1">加入房間</h3>
            {roomFull ? (
                <p id="room-full-msg" className="text-amber-400 text-sm mb-2" role="status">房間已滿（{currentPlayersCount}/{maxPlayers} 人），無法加入</p>
            ) : (
                <p className="text-white/60 text-sm mb-2">輸入暱稱後加入</p>
            )}
            {/* T070 P2：遊戲可匿名或暱稱，規則清楚 */}
            <p className="text-white/50 text-xs mb-2">可不填真實姓名，暱稱即可。</p>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2"
                aria-label="加入房間表單"
            >
                <div className="flex gap-2">
                    <label htmlFor="room-join-name" className="sr-only">{t('games.roomJoinNameLabel')}</label>
                    <input
                        id="room-join-name"
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value.slice(0, 20)); setError(null); }}
                        placeholder="你的暱稱"
                        maxLength={20}
                        required
                        aria-required="true"
                        aria-label={t('games.roomJoinNameLabel')}
                        aria-invalid={!!error}
                        aria-describedby={error ? 'room-join-error' : undefined}
                        className="flex-1 min-h-[48px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/30"
                    />
                    <button
                        type="button"
                        onClick={() => setName(RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)] as string)}
                        className="min-h-[48px] px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium shrink-0"
                        title="隨機暱稱"
                    >
                        隨機
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim() || roomFull}
                        className="min-h-[48px] min-w-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold"
                        aria-describedby={roomFull ? 'room-full-msg' : undefined}
                    >
                        加入
                    </button>
                    <button
                        type="button"
                        onClick={() => onJoinSpectator(name.trim(), password || undefined)}
                        disabled={!name.trim() || roomFull}
                        className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-sm font-medium"
                        title="以觀戰者身份加入，僅觀看不參與"
                        aria-label="以觀戰者身份加入（僅觀看，不參與遊戲）"
                        aria-describedby={roomFull ? 'room-full-msg' : undefined}
                    >
                        觀戰
                    </button>
                </div>
                <div className="relative flex items-center">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        inputMode="numeric"
                        autoComplete="off"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(null); }}
                        placeholder="房間密碼（若房主有設定）"
                        maxLength={4}
                        aria-label="房間密碼（若房主有設定）"
                        aria-invalid={!!error}
                        aria-describedby={error ? 'room-join-error' : undefined}
                        className="min-h-[48px] w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white placeholder-white/30 text-sm"
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
            </form>
            {error && <p id="room-join-error" className="text-red-400 text-sm mt-2" role="alert" aria-live="assertive">{error}</p>}
        </div>
    )
}
