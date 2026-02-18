// Task 1.2.1: Lazy load individual game components
import dynamic from 'next/dynamic'
import { GamesLoadingFallback } from '@/components/games/GamesLoadingFallback'

export const LazyAlcoholTrivia = dynamic(
  () => import('@/components/games/AlcoholTrivia'),
  { 
    loading: () => <GamesLoadingFallback />,
    ssr: false 
  }
)

export const LazyAnimeQuiz = dynamic(
  () => import('@/components/games/AnimeQuiz'),
  { 
    loading: () => <GamesLoadingFallback />,
    ssr: false 
  }
)

export const LazyBalanceGame = dynamic(
  () => import('@/components/games/BalanceGame'),
  { 
    loading: () => <GamesLoadingFallback />,
    ssr: false 
  }
)

export const LazyBaskinRobbins31 = dynamic(
  () => import('@/components/games/BaskinRobbins31'),
  { 
    loading: () => <GamesLoadingFallback />,
    ssr: false 
  }
)

export const LazyBetweenCards = dynamic(
  () => import('@/components/games/BetweenCards'),
  { 
    loading: () => <GamesLoadingFallback />,
    ssr: false 
  }
)

// Export all lazy-loaded games in a map for easy access
export const LAZY_GAMES = {
  'alcohol-trivia': LazyAlcoholTrivia,
  'anime-quiz': LazyAnimeQuiz,
  'balance-game': LazyBalanceGame,
  'baskin-robbins-31': LazyBaskinRobbins31,
  'between-cards': LazyBetweenCards,
} as const

export type LazyGameKey = keyof typeof LAZY_GAMES