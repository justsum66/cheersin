'use client'

/**
 * 派對房加入介面：訪客輸入暱稱 + (可選) 密碼
 * 用於 GamesRoomPartyView 當使用者不在 players 列表時顯示
 */

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Users, Lock, ArrowRight, Music, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

interface PartyRoomJoinProps {
    roomSlug: string
    hasPassword?: boolean
    onJoin: (name: string, password?: string) => Promise<{ ok: boolean; error?: string }>
}

export function PartyRoomJoin({ roomSlug, hasPassword, onJoin }: PartyRoomJoinProps) {
    const { t } = useTranslation()
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        // 檢查密碼：若有鎖則必填
        if (hasPassword && !password.trim()) {
            setError(t('partyRoom.passwordRequired') ?? '請輸入房間密碼')
            return
        }

        setLoading(true)
        setError(null)

        // 呼叫上層提供的 join
        const res = await onJoin(name, password)
        if (!res.ok) {
            setError(res.error || (t('common.error') ?? '發生錯誤'))
            setLoading(false)
        }
        // 成功後上層會自動切換為 Active View，不需在此 setLoading(false)
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* 背景裝飾 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-6 shadow-glow rotate-3">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-white mb-2 text-center">
                            {t('partyRoom.joinTitle') ?? '加入派對'}
                        </h1>
                        <p className="text-white/60 text-center">
                            {hasPassword
                                ? (t('partyRoom.privateRoomDesc') ?? '這是一個私人房間，請輸入密碼加入')
                                : (t('partyRoom.publicRoomDesc') ?? '輸入你的暱稱，立即加入遊戲！')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="nickname" className="text-sm font-medium text-white/80 ml-1">
                                    {t('partyRoom.nicknameLabel') ?? '你的暱稱'}
                                </label>
                                <div className="relative group">
                                    <input
                                        id="nickname"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t('partyRoom.nicknamePlaceholder') ?? '例如：派對之王'}
                                        className="w-full h-14 pl-5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                        disabled={loading}
                                        autoFocus
                                        maxLength={20}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-400 transition-colors pointer-events-none">
                                        <Music className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {hasPassword && (
                                    <m.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2"
                                    >
                                        <label htmlFor="room-password" className="text-sm font-medium text-white/80 ml-1">
                                            {t('partyRoom.passwordLabel') ?? '房間密碼'}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                id="room-password"
                                                type="password" // 隱藏輸入
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••"
                                                className="w-full h-14 pl-5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none font-mono tracking-widest text-lg"
                                                disabled={loading}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-400 transition-colors pointer-events-none">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <m.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </m.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || !name.trim() || (!!hasPassword && !password)}
                            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t('partyRoom.joinBtn') ?? '加入房間'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-white/30 text-sm mt-6">
                    {t('partyRoom.joinHelp') ?? '加入即代表同意我們的使用者條款'}
                </p>
            </m.div>
        </div>
    )
}
