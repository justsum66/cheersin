/**
 * PWA-020: Offline Game Mode configuration.
 * Lists single-player games that can be played offline after initial cache.
 * The SW pre-caches assets for these games during install.
 */

export interface OfflineGameEntry {
  /** Game slug matching games.config.ts key */
  slug: string
  /** Human-readable display name */
  name: string
  /** Minimum assets required for offline play */
  requiredAssets: string[]
  /** Whether the game needs any server API (false = fully offline capable) */
  requiresApi: boolean
}

export const OFFLINE_GAMES: OfflineGameEntry[] = [
  {
    slug: 'coin-flip',
    name: '擲硬幣',
    requiredAssets: ['/games/coin-flip'],
    requiresApi: false,
  },
  {
    slug: 'dice',
    name: '骰子',
    requiredAssets: ['/games/dice'],
    requiresApi: false,
  },
  {
    slug: 'roulette',
    name: '輪盤',
    requiredAssets: ['/games/roulette'],
    requiresApi: false,
  },
  {
    slug: 'truth-or-dare',
    name: '真心話大冒險',
    requiredAssets: ['/games/truth-or-dare'],
    requiresApi: false,
  },
  {
    slug: 'never-have-i-ever',
    name: '我從來沒有',
    requiredAssets: ['/games/never-have-i-ever'],
    requiresApi: false,
  },
]

/** URLs to pre-cache for offline game support */
export function getOfflineGameUrls(): string[] {
  return OFFLINE_GAMES.flatMap((g) => g.requiredAssets)
}
