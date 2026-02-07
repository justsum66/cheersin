'use client'

import type React from 'react'
import { lazy, Suspense } from 'react'

/** 任務 2：遊戲 chunk 載入器；任務 3：依分類打包成單一 chunk 減少請求數 */
type GameLoader = () => Promise<{ default: React.ComponentType }>
const GAME_LOADERS: Record<string, GameLoader> = {
  'truth-or-dare': () => import(/* webpackChunkName: "games-party" */ './TruthOrDare'),
  roulette: () => import(/* webpackChunkName: "games-party" */ './Roulette'),
  trivia: () => import(/* webpackChunkName: "games-guess" */ './Trivia'),
  dice: () => import(/* webpackChunkName: "games-draw" */ './Dice'),
  'never-have-i-ever': () => import(/* webpackChunkName: "games-party" */ './NeverHaveIEver'),
  'kings-cup': () => import(/* webpackChunkName: "games-party" */ './KingsCup'),
  'baskin-robbins-31': () => import(/* webpackChunkName: "games-guess" */ './BaskinRobbins31'),
  'up-down-stairs': () => import(/* webpackChunkName: "games-guess" */ './UpDownStairs'),
  'countdown-toast': () => import(/* webpackChunkName: "games-reaction" */ './CountdownToast'),
  'random-picker': () => import(/* webpackChunkName: "games-draw" */ './RandomPicker'),
  'drink-or-safe': () => import(/* webpackChunkName: "games-draw" */ './DrinkOrSafe'),
  'high-low': () => import(/* webpackChunkName: "games-guess" */ './HighLow'),
  titanic: () => import(/* webpackChunkName: "games-other" */ './Titanic'),
  'finger-guessing': () => import(/* webpackChunkName: "games-other" */ './FingerGuessing'),
  'name-train': () => import(/* webpackChunkName: "games-party" */ './NameTrain'),
  'liar-dice': () => import(/* webpackChunkName: "games-draw" */ './LiarDice'),
  'coin-flip': () => import(/* webpackChunkName: "games-draw" */ './CoinFlip'),
  'who-is-undercover': () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/WhoIsUndercover'),
  'werewolf-lite': () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/WerewolfLite'),
  'heartbeat-challenge': () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/HeartbeatChallenge'),
  'mimic-face': () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/MimicFace'),
  'chemistry-test': () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/ChemistryTest'),
  charades: () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/Charades'),
  'would-you-rather': () => import(/* webpackChunkName: "games-facetoface" */ './FaceToFace/WouldYouRather'),

  'punishment-wheel': () => import(/* webpackChunkName: "games-other" */ './Punishments/PunishmentWheel'),
  'who-most-likely': () => import(/* webpackChunkName: "games-party" */ './WhoMostLikely'),
  'secret-reveal': () => import(/* webpackChunkName: "games-party" */ './SecretReveal'),
  'thirteen-cards': () => import(/* webpackChunkName: "games-other" */ './ThirteenCards'),
  blackjack: () => import(/* webpackChunkName: "games-other" */ './Blackjack'),
  'hot-potato': () => import(/* webpackChunkName: "games-reaction" */ './HotPotato'),
  'seven-tap': () => import(/* webpackChunkName: "games-reaction" */ './SevenTap'),
  'spin-bottle': () => import(/* webpackChunkName: "games-party" */ './SpinBottle'),
  'dare-dice': () => import(/* webpackChunkName: "games-draw" */ './DareDice'),
  'rhythm-guess': () => import(/* webpackChunkName: "games-reaction" */ './RhythmGuess'),
  'toast-relay': () => import(/* webpackChunkName: "games-party" */ './ToastRelay'),
  'number-bomb': () => import(/* webpackChunkName: "games-guess" */ './NumberBomb'),
  '369-clap': () => import(/* webpackChunkName: "games-reaction" */ './ThreeSixNineClap'),
  'buzz-game': () => import(/* webpackChunkName: "games-reaction" */ './BuzzGame'),
  'category-chain': () => import(/* webpackChunkName: "games-party" */ './CategoryChain'),
  'two-truths-one-lie': () => import(/* webpackChunkName: "games-facetoface" */ './TwoTruthsOneLie'),
  'spicy-truth-or-dare': () => import(/* webpackChunkName: "games-adult" */ './SpicyTruthOrDare'),
  'spicy-never-have-i-ever': () => import(/* webpackChunkName: "games-adult" */ './SpicyNeverHaveIEver'),
  'spicy-who-most-likely': () => import(/* webpackChunkName: "games-adult" */ './SpicyWhoMostLikely'),
  // Phase 2 新遊戲
  'quick-qa': () => import(/* webpackChunkName: "games-reaction" */ './QuickQA'),
  'between-cards': () => import(/* webpackChunkName: "games-guess" */ './BetweenCards'),
  'russian-roulette': () => import(/* webpackChunkName: "games-party" */ './RussianRoulette'),

  'couple-test': () => import(/* webpackChunkName: "games-facetoface" */ './CoupleTest'),

  'spicy-would-you-rather': () => import(/* webpackChunkName: "games-adult" */ './SpicyWouldYouRather'),
  'paranoia-game': () => import(/* webpackChunkName: "games-party" */ './ParanoiaGame'),
  'secret-confession': () => import(/* webpackChunkName: "games-party" */ './SecretConfession'),
  'dare-cards': () => import(/* webpackChunkName: "games-party" */ './DareCards'),
  'memory-game': () => import(/* webpackChunkName: "games-reaction" */ './MemoryGame'),
  'mind-reading': () => import(/* webpackChunkName: "games-facetoface" */ './MindReading'),
  'spicy-dice': () => import(/* webpackChunkName: "games-adult" */ './SpicyDice'),
  // Phase 3 新遊戲
  'reaction-master': () => import(/* webpackChunkName: "games-reaction" */ './ReactionMaster'),
  'drunk-truth': () => import(/* webpackChunkName: "games-party" */ './DrunkTruth'),
  'late-night': () => import(/* webpackChunkName: "games-party" */ './LateNight'),
  // Phase 4 新遊戲
  'drinking-word': () => import(/* webpackChunkName: "games-party" */ './DrinkingWord'),
  'guess-song': () => import(/* webpackChunkName: "games-party" */ './GuessSong'),
  'photo-guess': () => import(/* webpackChunkName: "games-party" */ './PhotoGuess'),
  'word-chain': () => import(/* webpackChunkName: "games-party" */ './WordChain'),
  'team-guess': () => import(/* webpackChunkName: "games-facetoface" */ './TeamGuess'),
  'balance-game': () => import(/* webpackChunkName: "games-guess" */ './BalanceGame'),
  'fortune-draw': () => import(/* webpackChunkName: "games-draw" */ './FortuneDraw'),

  'truth-wheel': () => import(/* webpackChunkName: "games-party" */ './TruthWheel'),
  'word-guess': () => import(/* webpackChunkName: "games-guess" */ './WordGuess'),
  'photo-bomb': () => import(/* webpackChunkName: "games-party" */ './PhotoBomb'),
  // Phase 5 新遊戲
  'flash-card': () => import(/* webpackChunkName: "games-reaction" */ './FlashCard'),
  'draw-guess': () => import(/* webpackChunkName: "games-party" */ './DrawGuess'),
  'taboo': () => import(/* webpackChunkName: "games-party" */ './Taboo'),
  'spot-diff': () => import(/* webpackChunkName: "games-reaction" */ './SpotDiff'),
  'quick-math': () => import(/* webpackChunkName: "games-reaction" */ './QuickMath'),
  'color-blind': () => import(/* webpackChunkName: "games-reaction" */ './ColorBlind'),
  'rhythm-tap': () => import(/* webpackChunkName: "games-reaction" */ './RhythmTap'),
  'finger-point': () => import(/* webpackChunkName: "games-reaction" */ './FingerPoint'),
  'shot-roulette': () => import(/* webpackChunkName: "games-party" */ './ShotRoulette'),
  'music-chair': () => import(/* webpackChunkName: "games-party" */ './MusicChair'),
  'bottle-cap': () => import(/* webpackChunkName: "games-party" */ './BottleCap'),
  // Phase 6 新遊戲
  'word-scramble': () => import(/* webpackChunkName: "games-reaction" */ './WordScramble'),
  'emotion-read': () => import(/* webpackChunkName: "games-reaction" */ './EmotionRead'),
  'fast-type': () => import(/* webpackChunkName: "games-reaction" */ './FastType'),
  'dice-war': () => import(/* webpackChunkName: "games-party" */ './DiceWar'),
  'price-guess': () => import(/* webpackChunkName: "games-guess" */ './PriceGuess'),
  'tongue-challenge': () => import(/* webpackChunkName: "games-party" */ './TongueChallenge'),
  'imitate-me': () => import(/* webpackChunkName: "games-party" */ './ImitateMe'),
  'quiz-battle': () => import(/* webpackChunkName: "games-guess" */ './QuizBattle'),
  'lucky-draw': () => import(/* webpackChunkName: "games-draw" */ './LuckyDraw'),
  'time-freeze': () => import(/* webpackChunkName: "games-reaction" */ './TimeFreeze'),
  'stare-contest': () => import(/* webpackChunkName: "games-facetoface" */ './StareContest'),
  'bluffing': () => import(/* webpackChunkName: "games-party" */ './Bluffing'),
  // Phase 7 新遊戲
  'telephone': () => import(/* webpackChunkName: "games-party" */ './Telephone'),
  'finish-lyric': () => import(/* webpackChunkName: "games-party" */ './FinishLyric'),
  'tic-tac-shot': () => import(/* webpackChunkName: "games-facetoface" */ './TicTacShot'),
  'compliment-battle': () => import(/* webpackChunkName: "games-party" */ './ComplimentBattle'),
  'cocktail-mix': () => import(/* webpackChunkName: "games-party" */ './CocktailMix'),
  'reverse-say': () => import(/* webpackChunkName: "games-reaction" */ './ReverseSay'),
  'riddle-guess': () => import(/* webpackChunkName: "games-party" */ './RiddleGuess'),
  'story-chain': () => import(/* webpackChunkName: "games-party" */ './StoryChain'),
}

/** React.lazy 遊戲組件對照表：選中時才載入，減少首屏 bundle */
const GAME_LAZY_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = Object.fromEntries(
  Object.entries(GAME_LOADERS).map(([id, loader]) => [id, lazy(loader)])
)

/** 任務 2：預載指定遊戲 chunk，供「最近玩過」等預測用 */
export function prefetchGame(gameId: string): void {
  const loader = GAME_LOADERS[gameId]
  if (loader) loader().catch((err) => {
    console.error('[GameLazyMap] prefetch failed', gameId, err)
  })
}

/** P004: Top 5 most played games - prefetch on idle for better UX */
const TOP_GAMES = [
  'truth-or-dare',
  'never-have-i-ever',
  'kings-cup',
  'roulette',
  'dice',
] as const

/** P004: Prefetch top 5 games on idle to improve perceived performance */
export function prefetchTopGames(): void {
  if (typeof window === 'undefined') return
  
  // Use requestIdleCallback if available, otherwise fallback to setTimeout
  const scheduleTask = (window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1000))) as typeof requestIdleCallback
  
  scheduleTask(() => {
    TOP_GAMES.forEach((gameId, index) => {
      // Stagger prefetch to avoid network congestion
      setTimeout(() => {
        prefetchGame(gameId)
      }, index * 500)
    })
  })
}

function GameLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4" role="status" aria-label="載入遊戲中">
      <div className="w-12 h-12 rounded-full border-2 border-primary-500/50 border-t-primary-500 animate-spin" />
      <span className="text-white/50 text-sm">載入遊戲中…</span>
    </div>
  )
}

export function LazyGame({ gameId }: { gameId: string }) {
  const LazyComponent = GAME_LAZY_MAP[gameId]
  if (!LazyComponent) return null
  return (
    <Suspense fallback={<GameLoadingFallback />}>
      <LazyComponent />
    </Suspense>
  )
}
