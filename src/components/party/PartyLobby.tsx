'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useGameRoom } from '@/hooks/useGameRoom'
import { logger } from '@/lib/logger'
import { toast } from 'react-hot-toast'

export default function PartyLobby() {
    const [joinCode, setJoinCode] = useState('')
    const [password, setPassword] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const router = useRouter()

    // 使用 useGameRoom(null) 取得 createRoom 方法
    const { createRoom } = useGameRoom(null)

    const handleCreateRoom = async () => {
        setIsCreating(true)
        try {
            // 呼叫 API 創建房間
            const result = await createRoom({
                password: password || undefined
            })

            if ('error' in result && result.error) {
                toast.error(result.error)
                return
            }

            if ('slug' in result && result.slug) {
                toast.success('派對房間已創建！')
                // 導向到新房間
                window.location.href = `/games?room=${result.slug}`
            }
        } catch (error) {
            logger.error('Party create room failed', { err: error instanceof Error ? error.message : String(error) })
            toast.error('創建失敗')
        } finally {
            setIsCreating(false)
        }
    }

    const handleJoinRoom = async () => {
        if (!joinCode) return
        setIsJoining(true)
        try {
            // joinCode 即為 slug
            // 直接導向，由 PartyRoomPageClient 處理加入邏輯 (含密碼驗證)
            window.location.href = `/games?room=${joinCode}`
        } catch (error) {
            toast.error('加入失敗')
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 glass-card rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">加入或創建派對</h2>

            <div className="space-y-6">
                <div className="space-y-3">
                    <button
                        onClick={handleCreateRoom}
                        disabled={isCreating}
                        className="w-full btn-primary py-4 text-lg shadow-lg hover:shadow-primary-500/20"
                    >
                        {isCreating ? '創建中...' : '🎉 創建新派對'}
                    </button>

                    {/* 密碼設定選項 (Toggle) */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowPasswordInput(!showPasswordInput)}
                            className="text-white/40 text-sm hover:text-white/70 transition-colors flex items-center gap-1"
                        >
                            {showPasswordInput ? '取消密碼保護' : '+ 設定房間密碼 (可選)'}
                        </button>

                        {showPasswordInput && (
                            <m.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full"
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        placeholder="設定 4 位數密碼"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                </div>
                            </m.div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0a0a0a] text-white/50">或者</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="輸入房間代碼"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:border-primary/50 transition-colors uppercase"
                        />
                    </div>
                    <button
                        onClick={handleJoinRoom}
                        disabled={!joinCode || isJoining}
                        className="w-full btn-secondary py-3"
                    >
                        {isJoining ? '加入中...' : '加入房間'}
                    </button>
                </div>
            </div>
        </div>
    )
}
