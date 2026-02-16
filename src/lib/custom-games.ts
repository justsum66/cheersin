import { useLocalStorage } from '@/hooks/useLocalStorage'
import { nanoid } from 'nanoid'

/**
 * Custom Games Schema
 * Inherits basic metadata from GameMeta but adds specific content structure.
 */

export interface CustomGameCard {
    id: string
    text: string
    type: 'truth' | 'dare' | 'plain' // plain for simple card draw
    category?: string
}

export interface CustomGame {
    id: string
    isCustom: true
    name: string
    description: string
    iconName: string // Store icon name as string, map to Lucide icon in UI
    color: 'primary' | 'secondary' | 'accent' | 'white'
    createdAt: number
    updatedAt: number
    content: CustomGameCard[]
}

const STORAGE_KEY = 'cheersin_custom_games'

export function useCustomGames() {
    const [games, setGames, removeGames] = useLocalStorage<CustomGame[]>(STORAGE_KEY, [])

    const addGame = (game: Omit<CustomGame, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => {
        const newGame: CustomGame = {
            ...game,
            id: `custom_${nanoid(8)}`,
            isCustom: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setGames((prev) => [newGame, ...prev])
        return newGame
    }

    const updateGame = (id: string, updates: Partial<Omit<CustomGame, 'id' | 'isCustom' | 'createdAt'>>) => {
        setGames((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g))
        )
    }

    const deleteGame = (id: string) => {
        setGames((prev) => prev.filter((g) => g.id !== id))
    }

    const getGame = (id: string) => games.find((g) => g.id === id)

    return {
        games,
        addGame,
        updateGame,
        deleteGame,
        getGame,
    }
}
