/**
 * Phase 3 Stage 2: useGameStorage Hook
 * Specialized storage hook for game state management with advanced features
 */

import { useCallback } from 'react'
import { usePersistentStorage } from './usePersistentStorage'

type GameDataType = 'player' | 'score' | 'progress' | 'settings' | 'session' | 'achievement'

interface GameStorageOptions<T> {
  /** Game-specific key prefix */
  gameId: string
  /** Data type for organization */
  dataType: GameDataType
  /** Additional key suffix */
  suffix?: string
  /** Validation function */
  validate?: (data: unknown) => data is T
  /** Fallback value if validation fails */
  fallbackValue?: T
  /** Storage type */
  storage?: 'local' | 'session'
  /** Debounce write operations */
  debounceMs?: number
}

interface GameStorageStats {
  /** Total storage used by game */
  totalUsed: number
  /** Number of stored items */
  itemCount: number
  /** Storage type distribution */
  storageTypes: Record<string, number>
}

/**
 * Specialized game storage hook with organization and validation
 */
export function useGameStorage<T>(
  options: GameStorageOptions<T>
) {
  const {
    gameId,
    dataType,
    suffix = '',
    validate,
    fallbackValue,
    storage = 'local',
    debounceMs = 100
  } = options

  // Generate organized key
  const generateKey = useCallback((itemId?: string | number): string => {
    const baseKey = `game_${gameId}_${dataType}`
    const keyParts = [baseKey]
    
    if (suffix) keyParts.push(suffix)
    if (itemId !== undefined) keyParts.push(String(itemId))
    
    return keyParts.join('_')
  }, [gameId, dataType, suffix])

  // Single item storage
  const useItem = (itemId?: string | number) => {
    const key = generateKey(itemId)
    return usePersistentStorage<T>(key, undefined as unknown as T, {
      storage,
      debounceMs,
      validate,
      fallbackValue
    })
  }

  // List storage (for multiple items of same type)
  const useList = () => {
    const key = generateKey('list')
    return usePersistentStorage<T[]>(key, [], {
      storage,
      debounceMs,
      validate: (data): data is T[] => Array.isArray(data),
      fallbackValue: []
    })
  }

  // Map storage (for keyed items)
  const useMap = () => {
    const key = generateKey('map')
    return usePersistentStorage<Record<string, T>>(key, {}, {
      storage,
      debounceMs,
      validate: (data): data is Record<string, T> => {
        return data !== null && typeof data === 'object' && !Array.isArray(data)
      },
      fallbackValue: {}
    })
  }

  // Counter storage
  const useCounter = (initialValue: number = 0) => {
    const key = generateKey('counter')
    return usePersistentStorage<number>(key, initialValue, {
      storage,
      debounceMs,
      validate: (data): data is number => typeof data === 'number',
      fallbackValue: initialValue
    })
  }

  // Toggle storage
  const useToggle = (initialValue: boolean = false) => {
    const key = generateKey('toggle')
    return usePersistentStorage<boolean>(key, initialValue, {
      storage,
      debounceMs,
      validate: (data): data is boolean => typeof data === 'boolean',
      fallbackValue: initialValue
    })
  }

  return {
    useItem,
    useList,
    useMap,
    useCounter,
    useToggle,
    generateKey
  }
}

/**
 * Game session storage for temporary game data
 */
export function useGameSession<T>(
  gameId: string,
  dataType: GameDataType,
  suffix?: string
) {
  return useGameStorage<T>({
    gameId,
    dataType,
    suffix,
    storage: 'session'
  })
}

/**
 * Game settings storage with validation
 */
export function useGameSettings<T extends Record<string, any>>(
  gameId: string,
  validator?: (settings: unknown) => settings is T
) {
  const storage = useGameStorage<T>({
    gameId,
    dataType: 'settings',
    validate: validator,
    fallbackValue: {} as T
  })

  const [settings, setSettings, removeSettings] = storage.useItem()

  const updateSetting = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setSettings])

  const resetSettings = useCallback(() => {
    removeSettings()
  }, [removeSettings])

  return {
    settings: settings || {} as T,
    setSettings,
    updateSetting,
    resetSettings,
    removeSettings
  }
}

/**
 * Player progress tracking
 */
export interface PlayerProgress {
  level: number
  experience: number
  completedLevels: number[]
  achievements: string[]
  playTime: number // seconds
  lastPlayed: number // timestamp
}

export function usePlayerProgress(gameId: string, playerId: string) {
  const storage = useGameStorage<PlayerProgress>({
    gameId,
    dataType: 'progress',
    suffix: playerId,
    fallbackValue: {
      level: 1,
      experience: 0,
      completedLevels: [],
      achievements: [],
      playTime: 0,
      lastPlayed: Date.now()
    }
  })

  const [progress, setProgress, removeProgress] = storage.useItem()

  const updateProgress = useCallback((updates: Partial<PlayerProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastPlayed: Date.now()
    }))
  }, [setProgress])

  const addExperience = useCallback((xp: number) => {
    setProgress(prev => {
      const newExp = (prev?.experience || 0) + xp
      const newLevel = Math.floor(newExp / 1000) + 1 // 1000 XP per level
      return {
        ...prev,
        experience: newExp,
        level: newLevel,
        lastPlayed: Date.now()
      }
    })
  }, [setProgress])

  const completeLevel = useCallback((levelId: number) => {
    setProgress(prev => ({
      ...prev,
      completedLevels: [...(prev?.completedLevels || []), levelId],
      lastPlayed: Date.now()
    }))
  }, [setProgress])

  const addAchievement = useCallback((achievementId: string) => {
    setProgress(prev => ({
      ...prev,
      achievements: [...(prev?.achievements || []), achievementId],
      lastPlayed: Date.now()
    }))
  }, [setProgress])

  const addPlayTime = useCallback((seconds: number) => {
    setProgress(prev => ({
      ...prev,
      playTime: (prev?.playTime || 0) + seconds,
      lastPlayed: Date.now()
    }))
  }, [setProgress])

  return {
    progress: progress || storage.useItem()[0], // fallback to default
    updateProgress,
    addExperience,
    completeLevel,
    addAchievement,
    addPlayTime,
    removeProgress
  }
}

/**
 * Game statistics tracking
 */
export interface GameStats {
  totalPlays: number
  totalPlayTime: number
  averagePlayTime: number
  completionRate: number
  highestScore: number
  lastPlayed: number
}

export function useGameStats(gameId: string) {
  const storage = useGameStorage<GameStats>({
    gameId,
    dataType: 'session',
    suffix: 'stats',
    fallbackValue: {
      totalPlays: 0,
      totalPlayTime: 0,
      averagePlayTime: 0,
      completionRate: 0,
      highestScore: 0,
      lastPlayed: 0
    }
  })

  const [stats, setStats, removeStats] = storage.useItem()

  const recordPlay = useCallback((playTime: number, completed: boolean = false, score?: number) => {
    setStats(prev => {
      const totalPlays = (prev?.totalPlays || 0) + 1
      const totalPlayTime = (prev?.totalPlayTime || 0) + playTime
      const completedPlays = (prev?.completionRate || 0) * (totalPlays - 1) + (completed ? 1 : 0)
      const highestScore = Math.max(prev?.highestScore || 0, score || 0)
      
      return {
        totalPlays,
        totalPlayTime,
        averagePlayTime: totalPlayTime / totalPlays,
        completionRate: completedPlays / totalPlays,
        highestScore,
        lastPlayed: Date.now()
      }
    })
  }, [setStats])

  const resetStats = useCallback(() => {
    removeStats()
  }, [removeStats])

  return {
    stats: stats || storage.useItem()[0],
    recordPlay,
    resetStats,
    removeStats
  }
}

/**
 * Utility functions for game storage management
 */
export class GameStorageUtils {
  static clearGameStorage(gameId: string): void {
    if (typeof window === 'undefined') return
    
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`game_${gameId}_`)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  static getGameStorageStats(gameId: string): GameStorageStats {
    if (typeof window === 'undefined') {
      return { totalUsed: 0, itemCount: 0, storageTypes: {} }
    }

    let totalUsed = 0
    let itemCount = 0
    const storageTypes: Record<string, number> = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`game_${gameId}_`)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalUsed += value.length
          itemCount++
          
          // Extract data type from key
          const typeMatch = key.match(/game_[^_]+_([^_]+)/)
          if (typeMatch) {
            const type = typeMatch[1]
            storageTypes[type] = (storageTypes[type] || 0) + 1
          }
        }
      }
    }

    return { totalUsed, itemCount, storageTypes }
  }

  static exportGameData(gameId: string): Record<string, any> {
    if (typeof window === 'undefined') return {}

    const data: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`game_${gameId}_`)) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = JSON.parse(value)
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
    return data
  }

  static importGameData(gameId: string, data: Record<string, any>): void {
    if (typeof window === 'undefined') return

    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(`game_${gameId}_`)) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.warn(`Failed to import data for key ${key}:`, error)
        }
      }
    })
  }
}