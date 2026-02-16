import { STORAGE_KEYS } from '@/lib/constants'
import { getWeeklyPlayCounts, incrementWeeklyPlay, type WeeklyData } from '@/modules/games/stats/weekly'
import { getFavorites, isFavorite, addFavorite, removeFavorite } from '@/modules/games/user/favorites'
import { getLastSessionGameId, setLastSessionGameId } from '@/modules/games/user/history'
import { getAllPlaylists, getPlaylistById, type GamePlaylist } from '@/modules/games/data/playlists'

/**
 * Phase 1 Task 13: 統計數據遷移腳本
 * 將舊版獨立遊戲 ID (如 spicy-truth-or-dare) 的數據合併至新版 ID (truth-or-dare)
 */

const MIGRATION_MAP: Record<string, string | null> = {
    // 1. Merge "Spicy" Variants
    'spicy-truth-or-dare': 'truth-or-dare',
    'spicy-never-have-i-ever': 'never-have-i-ever',
    'spicy-who-most-likely': 'who-most-likely',
    'spicy-would-you-rather': 'would-you-rather',
    'spicy-dice': 'dice',

    // 2. Consolidate "Draw/Random" Games
    'lucky-draw': 'random-picker', // Draw Lots mode
    'shot-roulette': 'roulette',   // Shot mode
    'dare-dice': 'dice',           // Dare mode

    // 3. Deprecated (Map to null if we want to drop stats, or keep as legacy if we want to preserve partial data? 
    // For now map to null to clean up stats, or map to closest equivalent?
    // 'drink-or-safe' was removed earlier, 'finger-guessing' removed earlier.
    // 'name-train' & 'mimic-face' are being deprecated but not yet removed. 
    // We can keep their stats for now until full removal.
}

const MIGRATION_DONE_KEY = 'cheersin_migration_v1_done'

export function migrateGameStats() {
    if (typeof window === 'undefined') return
    try {
        if (localStorage.getItem(MIGRATION_DONE_KEY)) return

        console.log('[Migration] Starting game stats migration...')

        // 1. Migrate Total Play Counts (STORAGE_KEYS.GAMES_STATS)
        migrateCounts(STORAGE_KEYS.GAMES_STATS)

        // 2. Migrate Weekly Play Counts (STORAGE_KEYS.GAMES_WEEKLY implied from games-weekly.ts)
        // Note: games-weekly.ts uses 'cheersin_games_weekly' internally, not exported in STORAGE_KEYS yet but verified in code.
        migrateWeeklyCounts('cheersin_games_weekly')

        // 3. Migrate Recent Games (STORAGE_KEYS.RECENT_GAMES)
        migrateRecentGames(STORAGE_KEYS.RECENT_GAMES)

        // 4. Migrate Playlists (STORAGE_KEYS.GAMES_PLAYLISTS)
        migratePlaylists(STORAGE_KEYS.GAMES_PLAYLISTS)

        localStorage.setItem(MIGRATION_DONE_KEY, 'true')
        console.log('[Migration] Game stats migration completed.')
    } catch (e) {
        console.error('[Migration] Failed to migrate game stats:', e)
    }
}

function migrateCounts(key: string) {
    const raw = localStorage.getItem(key)
    if (!raw) return

    try {
        // some keys might be just a number (stat?), but GAMES_STATS is likely a Record<string, number> or similar?
        // Wait, GamesPageClient line 97: parseInt(raw). It's a single number for 'cheersin_games_played'??
        // Let's re-read GamesPageClient line 97:
        // const raw = localStorage.getItem(STORAGE_KEYS.GAMES_STATS)
        // const n = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0
        // setFreeGamesPlayedCount(n)
        // It seems GAMES_STATS in GamesPageClient is just a TOTAL count of games played (for upgrade prompt).
        // So there is NO per-game total stats stored in localStorage?
        // Re-reading games-weekly.ts: it stores per-game counts for the week.
        // Re-reading GamesPageClient: `incrementWeeklyPlay(id)`.
        // It seems we DON'T have a persistent per-game total count in localStorage, only weekly and total-total.

        // Wait, `cheersin_games_weekly` handles weekly per-game.
        // Is there any other per-game stat?
        // Favorite games? `games-favorites.ts`.

        // Let's check games-favorites.ts content if possible, but assuming Migration Map is for IDs.
        // If GAMES_STATS is just a number, we don't need to migrate it (it's just count).

        return
    } catch { /* ignore */ }
}

function migrateWeeklyCounts(key: string) {
    const raw = localStorage.getItem(key)
    if (!raw) return

    try {
        const data = JSON.parse(raw) as WeeklyData
        if (!data || !data.counts) return

        let changed = false
        const newCounts = { ...data.counts }

        for (const [oldId, targetId] of Object.entries(MIGRATION_MAP)) {
            if (targetId && newCounts[oldId]) {
                // Merge count to target
                newCounts[targetId] = (newCounts[targetId] || 0) + newCounts[oldId]
                delete newCounts[oldId]
                changed = true
            } else if (targetId === null && newCounts[oldId]) {
                // Remove deprecated
                delete newCounts[oldId]
                changed = true
            }
        }

        if (changed) {
            data.counts = newCounts
            localStorage.setItem(key, JSON.stringify(data))
        }
    } catch { /* ignore */ }
}

function migrateRecentGames(key: string) {
    const raw = localStorage.getItem(key)
    if (!raw) return

    try {
        const list = JSON.parse(raw)
        if (!Array.isArray(list)) return

        let changed = false
        const newList = list.map(id => {
            if (id in MIGRATION_MAP) {
                changed = true
                return MIGRATION_MAP[id]
            }
            return id
        }).filter((id): id is string => id !== null) // Filter out nulls (deprecated/removed)

        // Deduplicate
        const uniqueList = Array.from(new Set(newList))
        if (uniqueList.length !== list.length) changed = true

        if (changed) {
            localStorage.setItem(key, JSON.stringify(uniqueList))
        }
    } catch { /* ignore */ }
}

function migratePlaylists(key: string) {
    const raw = localStorage.getItem(key)
    if (!raw) return

    try {
        const playlists = JSON.parse(raw)
        if (!Array.isArray(playlists)) return

        let changed = false
        const newPlaylists = playlists.map((p: GamePlaylist) => {
            if (!p.gameIds) return p

            const newIds = p.gameIds.map(id => {
                if (!id) return null
                if (id in MIGRATION_MAP) {
                    return MIGRATION_MAP[id] // might be null
                }
                return id
            }).filter((id): id is string => id !== null)

            // Check if changed
            if (newIds.length !== p.gameIds.length || newIds.some((id, i) => id !== p.gameIds[i])) {
                changed = true
                return { ...p, gameIds: newIds }
            }
            return p
        })

        if (changed) {
            localStorage.setItem(key, JSON.stringify(newPlaylists))
        }
    } catch { /* ignore */ }
}
