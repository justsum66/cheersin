/**
 * GP-001~015: Google Play TWA Configuration
 * Centralized config for Trusted Web Activity setup and Android deployment.
 */

/** GP-001: TWA Requirements */
export const TWA_CONFIG = {
  /** Package name for Play Store listing */
  packageName: 'app.cheersin.twa',

  /** Host domain for Digital Asset Links */
  host: 'cheersin.app',

  /** Minimum Chrome version required for TWA */
  minChromeVersion: 72,

  /** Target Android API level */
  targetSdkVersion: 34,

  /** Minimum Android API level (Android 7.1+) */
  minSdkVersion: 25,

  /** GP-003: Required Lighthouse PWA score */
  minLighthousePwaScore: 90,

  /** GP-007: Splash screen configuration */
  splash: {
    backgroundColor: '#000000',
    iconPath: '/sizes/android_512.png',
    fadeOutDuration: 300,
  },

  /** GP-009: Supported screen orientations */
  orientation: 'portrait' as const,

  /** GP-014: Target APK size (bytes) */
  maxApkSizeBytes: 10 * 1024 * 1024, // 10MB
} as const

/** GP-005: Signing configuration (paths only, no secrets) */
export const SIGNING_CONFIG = {
  keystoreFile: 'cheersin-release.keystore',
  keyAlias: 'cheersin-twa',
  /** Use environment variable KEYSTORE_PASSWORD at build time */
}

/** GP-006: Play Store listing metadata */
export const PLAY_STORE_LISTING = {
  title: 'Cheersin 沁飲 — 你的靈魂之酒',
  shortDescription: 'AI 侍酒師 × 派對遊戲 × 品酒課程，聚會必備的品酒社交 App',
  fullDescription: `Cheersin 沁飲是你的 AI 派對靈魂伴侶。

🍷 靈魂酒測 — 回答有趣問題，發現命定酒款
🤖 AI 侍酒師 — 即時推薦、餐酒搭配
🎲 派對遊樂場 — 真心話大冒險、品酒猜猜樂等派對遊戲
📚 品酒學院 — 從入門到進階的品酒課程
🎭 劇本殺 — 品酒主題推理遊戲

免費開始，隨時升級 Pro 或 VIP 解鎖全部功能。`,
  category: 'ENTERTAINMENT',
  contentRating: 'Everyone', // No gambling, suitable for all ages with alcohol education
  privacyPolicyUrl: 'https://cheersin.app/privacy',
  defaultLanguage: 'zh-TW',
  screenshots: {
    phone: [
      { filename: 'screenshot_home.png', label: 'Home — Cheersin' },
      { filename: 'screenshot_quiz.png', label: 'Soul Wine Quiz' },
      { filename: 'screenshot_games.png', label: 'Party Games' },
      { filename: 'screenshot_assistant.png', label: 'AI Sommelier' },
      { filename: 'screenshot_learn.png', label: 'Wine Academy' },
    ],
    tablet: [
      { filename: 'screenshot_tablet_home.png', label: 'Home — Tablet' },
    ],
  },
  featureGraphic: 'feature_graphic_1024x500.png',
  icon: 'play_store_icon_512.png',
} as const

/** GP-008: In-app review prompt conditions */
export const IN_APP_REVIEW_CONFIG = {
  /** Minimum games completed before prompting */
  minGamesPlayed: 3,
  /** Minimum days since install */
  minDaysSinceInstall: 2,
  /** Maximum prompts per user */
  maxPromptsPerUser: 2,
  /** Days between prompts */
  daysBetweenPrompts: 30,
  /** localStorage key for tracking */
  storageKey: 'cheersin-review-prompt',
} as const

/** GP-012: Deep link paths that should be handled by the TWA */
export const DEEP_LINK_PATHS = [
  '/quiz',
  '/games',
  '/games/*',
  '/assistant',
  '/learn',
  '/learn/*',
  '/subscription',
  '/pricing',
  '/profile',
] as const

/** GP-015: App update strategy configuration */
export const APP_UPDATE_CONFIG = {
  /** Check for updates on app resume */
  checkOnResume: true,
  /** Minimum hours between update checks */
  minHoursBetweenChecks: 24,
  /** Force update for major version bumps */
  forceUpdateOnMajor: true,
  /** Current app version (sync with build.gradle) */
  currentVersion: '1.0.0',
  /** Version check endpoint */
  versionCheckUrl: '/api/app-version',
} as const
