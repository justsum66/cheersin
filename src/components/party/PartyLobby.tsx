'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { usePartyStore } from '@/store/usePartyStore'
import { logger } from '@/lib/logger'
import { toast } from 'react-hot-toast'

export default function PartyLobby() {
    const [joinCode, setJoinCode] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const router = useRouter()
    const supabase = createClientComponentClient()
    const setRoomInfo = usePartyStore(state => state.setRoomInfo)
    const addMember = usePartyStore(state => state.addMember)

    const handleCreateRoom = async () => {
        setIsCreating(true)
        try {
            // In a real app, you might insert into a 'rooms' table here for persistence
            // For this MVP, we use Realtime Presence/Broadcast, so just generate an ID.
            // We use a short code for easier joining if we had a mapping table, 
            // but without a DB table, we can't easily map short code -> UUID.
            // So let's assuming we use the UUID as the "room code" for direct links, 
            // or implement a simple KV mapping if possible. 
            // For now: UUID.

            const roomId = crypto.randomUUID()
            const roomCode = roomId.slice(0, 6).toUpperCase() // Simple collision-prone code for demo

            // Update store
            setRoomInfo(roomId, roomCode, true)

            // Navigate to room (optional, or just show UI)
            // router.push(`/party-room/${roomId}`) 
            // But we are in /party-room page mostly? 
            // Let's assume this component is inside /party-room/page.tsx or similar.

            toast.success('派對房間已創建！')
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
            // Logic to resolve room code to room ID would go here.
            // For MVP, assuming user enters the UUID or we use the code directly.
            const roomId = joinCode // Simplified

            setRoomInfo(roomId, joinCode, false)
            toast.success('加入成功！')
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
                <div>
                    <button
                        onClick={handleCreateRoom}
                        disabled={isCreating}
                        className="w-full btn-primary py-4 text-lg"
                    >
                        {isCreating ? '創建中...' : '🎉 創建新派對'}
                    </button>
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
                    <input
                        type="text"
                        placeholder="輸入房間代碼"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:border-primary/50 transition-colors"
                    />
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
