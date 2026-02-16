'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomGames, CustomGame } from '@/lib/custom-games'
import CustomGamePlayer from '@/components/games/CustomGamePlayer'
import { Loader2 } from 'lucide-react'

export default function CustomGamePlayPage() {
    const { id } = useParams()
    const router = useRouter()
    const { getGame, games } = useCustomGames() // games dependency ensures re-render if loaded later
    const [game, setGame] = useState<CustomGame | undefined>(undefined)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id && typeof id === 'string') {
            const found = getGame(id)
            setGame(found)
            // Small timeout to allow hydration if needed, though useCustomGames handles it
            setLoading(false)
        }
    }, [id, games, getGame])

    const handleExit = () => {
        router.push('/games')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!game) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
                <p className="text-white/60 mb-6">The custom game you are looking for does not exist.</p>
                <button onClick={handleExit} className="btn-secondary px-6 py-2 rounded-xl">
                    Back to Lobby
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-16 pb-safe safe-area-px bg-[#0a0a1a]">
            <CustomGamePlayer game={game} onExit={handleExit} />
        </div>
    )
}
