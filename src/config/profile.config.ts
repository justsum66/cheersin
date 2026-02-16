import { Wine, Flame, Gamepad2, BookOpen } from 'lucide-react'

export interface ProfileData {
    xp: number
    level: number
    nextLevel: number
    displayName: string | null
    reviewsGiven: number
    winesTasted: number
}

export const DEFAULT_PROFILE: ProfileData = {
    xp: 0,
    level: 1,
    nextLevel: 1000,
    displayName: null,
    reviewsGiven: 0,
    winesTasted: 0,
}

export const LEVEL_LABEL_KEYS: Record<number, string> = {
    1: 'profile.levelTrainee',
    2: 'profile.levelTrainee2',
    3: 'profile.levelConnoisseur',
    4: 'profile.levelConnoisseur2',
    5: 'profile.levelSommelier',
    6: 'profile.levelSommelier2',
    7: 'profile.levelSommelier3',
    8: 'profile.levelSommelier4',
    9: 'profile.levelMasterTrainee',
    10: 'profile.levelMaster',
}

export const LEVEL_PATH_KEYS = [
    { level: 1, xpRequired: 0, labelKey: 'profile.levelTrainee', rewardKey: 'profile.rewardAvatarBasic' },
    { level: 2, xpRequired: 2000, labelKey: 'profile.levelTrainee2', rewardKey: 'profile.rewardAvatarSilver' },
    { level: 3, xpRequired: 3000, labelKey: 'profile.levelConnoisseur', rewardKey: 'profile.rewardAvatarConnoisseur' },
    { level: 4, xpRequired: 4000, labelKey: 'profile.levelConnoisseur2', rewardKey: 'profile.rewardRouletteClassic' },
    { level: 5, xpRequired: 5000, labelKey: 'profile.levelSommelier', rewardKey: 'profile.rewardAvatarPro' },
    { level: 6, xpRequired: 6000, labelKey: 'profile.levelSommelier2', rewardKey: 'profile.rewardRouletteParty' },
    { level: 7, xpRequired: 7000, labelKey: 'profile.levelSommelier3', rewardKey: 'profile.rewardAvatarGold' },
    { level: 8, xpRequired: 8000, labelKey: 'profile.levelSommelier4', rewardKey: 'profile.rewardRouletteLimited' },
    { level: 9, xpRequired: 9000, labelKey: 'profile.levelMasterTrainee', rewardKey: 'profile.rewardAvatarMasterPreview' },
    { level: 10, xpRequired: 10000, labelKey: 'profile.levelMaster', rewardKey: 'profile.rewardAvatarMaster' },
]

export const ACHIEVEMENT_KEYS = [
    { id: 'first-quiz', labelKey: 'profile.achievementFirstQuiz', icon: Wine, unlocked: true },
    { id: 'streak-7', labelKey: 'profile.achievementStreak7', icon: Flame, unlocked: true },
    { id: 'games-10', labelKey: 'profile.achievementGames10', icon: Gamepad2, unlocked: false },
    { id: 'learn-1', labelKey: 'profile.achievementLearn1', icon: BookOpen, unlocked: false },
]

export const GAMES_STATS_KEY = 'cheersin_games_played'
export const WISHLIST_KEY = 'cheersin_wishlist'
