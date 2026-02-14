'use client'

import type React from 'react'
import { lazy, Suspense } from 'react'
import { logger } from '@/lib/logger'

/** R2-012 / PERF-003：依分類動態 Code Splitting，所有遊戲皆 lazy 載入，無首屏載入全部遊戲 */
type GameLoader = () => Promise<{ default: React.ComponentType }>
const GAME_LOADERS: Record<string, GameLoader> = {
  'truth-or-dare': () => import(/* webpackChunkName: "game-party-truth-or-dare" */ './TruthOrDare'),
  roulette: () => import(/* webpackChunkName: "game-party-roulette" */ './Roulette'),
  trivia: () => import(/* webpackChunkName: "game-guess-trivia" */ './Trivia'),
  dice: () => import(/* webpackChunkName: "game-draw-dice" */ './Dice'),
  'never-have-i-ever': () => import(/* webpackChunkName: "game-party-never-have-i-ever" */ './NeverHaveIEver'),
  'kings-cup': () => import(/* webpackChunkName: "game-party-kings-cup" */ './KingsCup'),
  'baskin-robbins-31': () => import(/* webpackChunkName: "game-guess-baskin-robbins-31" */ './BaskinRobbins31'),
  'up-down-stairs': () => import(/* webpackChunkName: "game-guess-up-down-stairs" */ './UpDownStairs'),
  'countdown-toast': () => import(/* webpackChunkName: "game-reaction-countdown-toast" */ './CountdownToast'),
  'random-picker': () => import(/* webpackChunkName: "game-draw-random-picker" */ './RandomPicker'),
  'high-low': () => import(/* webpackChunkName: "game-guess-high-low" */ './HighLow'),
  titanic: () => import(/* webpackChunkName: "game-other-titanic" */ './Titanic'),
  'name-train': () => import(/* webpackChunkName: "game-party-name-train" */ './NameTrain'),
  'liar-dice': () => import(/* webpackChunkName: "game-draw-liar-dice" */ './LiarDice'),
  'who-is-undercover': () => import(/* webpackChunkName: "game-facetoface-who-is-undercover" */ './FaceToFace/WhoIsUndercover'),
  'werewolf-lite': () => import(/* webpackChunkName: "game-facetoface-werewolf-lite" */ './FaceToFace/WerewolfLite'),
  'heartbeat-challenge': () => import(/* webpackChunkName: "game-facetoface-heartbeat-challenge" */ './FaceToFace/HeartbeatChallenge'),
  'mimic-face': () => import(/* webpackChunkName: "game-facetoface-mimic-face" */ './FaceToFace/MimicFace'),
  'chemistry-test': () => import(/* webpackChunkName: "game-facetoface-chemistry-test" */ './FaceToFace/ChemistryTest'),
  charades: () => import(/* webpackChunkName: "game-facetoface-charades" */ './FaceToFace/Charades'),
  'would-you-rather': () => import(/* webpackChunkName: "game-facetoface-would-you-rather" */ './FaceToFace/WouldYouRather'),

  'punishment-wheel': () => import(/* webpackChunkName: "game-other-punishment-wheel" */ './Punishments/PunishmentWheel'),
  'who-most-likely': () => import(/* webpackChunkName: "game-party-who-most-likely" */ './WhoMostLikely'),
  'secret-reveal': () => import(/* webpackChunkName: "game-party-secret-reveal" */ './SecretReveal'),
  'thirteen-cards': () => import(/* webpackChunkName: "game-other-thirteen-cards" */ './ThirteenCards'),
  blackjack: () => import(/* webpackChunkName: "game-other-blackjack" */ './Blackjack'),
  'hot-potato': () => import(/* webpackChunkName: "game-reaction-hot-potato" */ './HotPotato'),
  'seven-tap': () => import(/* webpackChunkName: "game-reaction-seven-tap" */ './SevenTap'),
  'dare-dice': () => import(/* webpackChunkName: "game-draw-dare-dice" */ './DareDice'),

  'toast-relay': () => import(/* webpackChunkName: "game-party-toast-relay" */ './ToastRelay'),
  'number-bomb': () => import(/* webpackChunkName: "game-guess-number-bomb" */ './NumberBomb'),
  '369-clap': () => import(/* webpackChunkName: "game-reaction-369-clap" */ './ThreeSixNineClap'),
  'buzz-game': () => import(/* webpackChunkName: "game-reaction-buzz-game" */ './BuzzGame'),
  'category-chain': () => import(/* webpackChunkName: "game-party-category-chain" */ './CategoryChain'),
  'two-truths-one-lie': () => import(/* webpackChunkName: "game-facetoface-two-truths-one-lie" */ './TwoTruthsOneLie'),
  // Phase 2 新遊戲

  'between-cards': () => import(/* webpackChunkName: "game-guess-between-cards" */ './BetweenCards'),
  'russian-roulette': () => import(/* webpackChunkName: "game-party-russian-roulette" */ './RussianRoulette'),

  'couple-test': () => import(/* webpackChunkName: "game-facetoface-couple-test" */ './CoupleTest'),

  'paranoia-game': () => import(/* webpackChunkName: "game-party-paranoia-game" */ './ParanoiaGame'),
  'secret-confession': () => import(/* webpackChunkName: "game-party-secret-confession" */ './SecretConfession'),
  'dare-cards': () => import(/* webpackChunkName: "game-party-dare-cards" */ './DareCards'),
  'mind-reading': () => import(/* webpackChunkName: "game-facetoface-mind-reading" */ './MindReading'),
  'reaction-master': () => import(/* webpackChunkName: "game-reaction-reaction-master" */ './ReactionMaster'),
  /** R2-140：各國喝酒文化（靜態/輕互動） */
  'drinking-culture': () => import(/* webpackChunkName: "game-other-drinking-culture" */ './DrinkingCulture'),
  /** R2-176：酒令（划拳/行酒令數位化） */
  jiuling: () => import(/* webpackChunkName: "game-other-jiuling" */ './Jiuling'),
  /** R2-178：酒類配對記憶（翻牌酒款⇄產區/風味） */
  'wine-memory-match': () => import(/* webpackChunkName: "game-party-wine-memory-match" */ './WineMemoryMatch'),
  /** R2-146：歷史知識問答喝酒版 */
  'history-trivia': () => import(/* webpackChunkName: "game-guess-history-trivia" */ './HistoryTrivia'),
  /** R2-154：真假新聞 */
  'true-false-news': () => import(/* webpackChunkName: "game-guess-true-false-news" */ './TrueFalseNews'),
  /** R2-158：誰說的 */
  'who-said-it': () => import(/* webpackChunkName: "game-guess-who-said-it" */ './WhoSaidIt'),
  /** R2-142：動漫猜謎喝酒遊戲 */
  'anime-quiz': () => import(/* webpackChunkName: "game-guess-anime-quiz" */ './AnimeQuiz'),
  /** R2-148：繞口令挑戰 */
  'tongue-twister': () => import(/* webpackChunkName: "game-party-tongue-twister" */ './TongueTwister'),
  /** R2-152：表情包大戰 */
  'emoji-battle': () => import(/* webpackChunkName: "game-party-emoji-battle" */ './EmojiBattle'),
  /** R2-166：模仿大賽 */
  'impersonation': () => import(/* webpackChunkName: "game-party-impersonation" */ './Impersonation'),
  /** R2-170：即興演講 */
  'impromptu-speech': () => import(/* webpackChunkName: "game-party-impromptu-speech" */ './ImpromptuSpeech'),
  /** R2-168：酒精知識王 */
  'alcohol-trivia': () => import(/* webpackChunkName: "game-guess-alcohol-trivia" */ './AlcoholTrivia'),
  /** R2-164：心理測驗喝酒版 */
  'psych-quiz': () => import(/* webpackChunkName: "game-party-psych-quiz" */ './PsychQuiz'),
  'drunk-truth': () => import(/* webpackChunkName: "game-party-drunk-truth" */ './DrunkTruth'),
  'drinking-word': () => import(/* webpackChunkName: "game-party-drinking-word" */ './DrinkingWord'),
  'guess-song': () => import(/* webpackChunkName: "game-party-guess-song" */ './GuessSong'),
  'photo-guess': () => import(/* webpackChunkName: "game-party-photo-guess" */ './PhotoGuess'),
  'word-chain': () => import(/* webpackChunkName: "game-party-word-chain" */ './WordChain'),
  'team-guess': () => import(/* webpackChunkName: "game-facetoface-team-guess" */ './TeamGuess'),
  'photo-bomb': () => import(/* webpackChunkName: "game-party-photo-bomb" */ './PhotoBomb'),
  'taboo': () => import(/* webpackChunkName: "game-party-taboo" */ './Taboo'),
  'spot-diff': () => import(/* webpackChunkName: "game-reaction-spot-diff" */ './SpotDiff'),
  'quick-math': () => import(/* webpackChunkName: "game-reaction-quick-math" */ './QuickMath'),
  'shot-roulette': () => import(/* webpackChunkName: "game-party-shot-roulette" */ './ShotRoulette'),
  'emotion-read': () => import(/* webpackChunkName: "game-reaction-emotion-read" */ './EmotionRead'),
  'dice-war': () => import(/* webpackChunkName: "game-facetoface-dice-war" */ './DiceWar'),
  'price-guess': () => import(/* webpackChunkName: "game-guess-price-guess" */ './PriceGuess'),
  'lucky-draw': () => import(/* webpackChunkName: "game-draw-lucky-draw" */ './LuckyDraw'),
  'bluffing': () => import(/* webpackChunkName: "game-party-bluffing" */ './Bluffing'),
  'telephone': () => import(/* webpackChunkName: "game-party-telephone" */ './Telephone'),
  'tic-tac-shot': () => import(/* webpackChunkName: "game-facetoface-tic-tac-shot" */ './TicTacShot'),
  'compliment-battle': () => import(/* webpackChunkName: "game-party-compliment-battle" */ './ComplimentBattle'),
  'cocktail-mix': () => import(/* webpackChunkName: "game-party-cocktail-mix" */ './CocktailMix'),
  'reverse-say': () => import(/* webpackChunkName: "game-reaction-reverse-say" */ './ReverseSay'),
  'riddle-guess': () => import(/* webpackChunkName: "game-party-riddle-guess" */ './RiddleGuess'),
  'story-chain': () => import(/* webpackChunkName: "game-party-story-chain" */ './StoryChain'),
  'memory-match': () => import(/* webpackChunkName: "game-party-memory-match" */ './MemoryMatch'),
  /* R2-011 去換皮：drinking-fist/captain-hook/count-seven/ultimate-code/support-front 已移除，與 finger-guessing/name-train/buzz-game/number-bomb/random-picker 共用組件 */
}

/** React.lazy 遊戲組件對照表：選中時才載入，減少首屏 bundle */
const GAME_LAZY_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = Object.fromEntries(
  Object.entries(GAME_LOADERS).map(([id, loader]) => [id, lazy(loader)])
)

/** 任務 2：預載指定遊戲 chunk，供「最近玩過」等預測用 */
export function prefetchGame(gameId: string): void {
  const loader = GAME_LOADERS[gameId]
  if (loader) loader().catch((err) => {
    logger.error('[GameLazyMap] prefetch failed', { gameId, err: err instanceof Error ? err.message : String(err) })
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
