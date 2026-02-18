/**
 * UA-013~040: Growth & Retention Configuration
 * Defines conversion funnels, viral loops, loyalty tiers, re-engagement sequences,
 * seasonal events, push notification strategy, and more.
 */

/** UA-013: Free-to-paid conversion funnel — 5 key touchpoints */
export const CONVERSION_FUNNEL = [
  { step: 1, name: 'First Visit', action: 'Land on homepage, see value prop', metric: 'page_view' },
  { step: 2, name: 'First Engagement', action: 'Complete soul wine quiz or play 1 game', metric: 'first_engagement' },
  { step: 3, name: 'Feature Wall', action: 'Hit free tier limit (AI chats, room size, game count)', metric: 'paywall_hit' },
  { step: 4, name: 'Pricing View', action: 'View pricing page, compare plans', metric: 'pricing_view' },
  { step: 5, name: 'Subscribe', action: 'Complete PayPal checkout', metric: 'subscription_success' },
] as const

/** UA-015: "Aha moment" — must happen within first 3 minutes */
export const AHA_MOMENT_CONFIG = {
  targetTimeSeconds: 180,
  triggers: [
    { id: 'quiz_result', label: 'Get personalized wine recommendation', priority: 1 },
    { id: 'first_game', label: 'Play first game round', priority: 2 },
    { id: 'ai_chat', label: 'Get first AI sommelier response', priority: 3 },
  ],
} as const

/** UA-016: Onboarding flow adapts to detected persona */
export const ONBOARDING_PATHS: Record<string, { steps: string[]; cta: string }> = {
  quiz: {
    steps: ['Welcome', 'Quick Quiz', 'Your Wine Profile', 'Explore Courses'],
    cta: 'Discover Your Wine',
  },
  games: {
    steps: ['Welcome', 'Pick a Game', 'Quick Play', 'Invite Friends'],
    cta: 'Start Playing',
  },
  learn: {
    steps: ['Welcome', 'Browse Courses', 'Start First Lesson', 'Track Progress'],
    cta: 'Start Learning',
  },
  assistant: {
    steps: ['Welcome', 'Ask Your First Question', 'Get Recommendation', 'Save Favorites'],
    cta: 'Chat with AI',
  },
}

/** UA-017: Viral loop mechanics */
export const VIRAL_LOOP = {
  trigger: 'game_completion',
  steps: [
    { action: 'Complete game', sharePrompt: true },
    { action: 'Share result card', inviteLink: true },
    { action: 'Friend clicks link', landingPage: '/games?ref={code}' },
    { action: 'Friend plays game', accountCreation: true },
    { action: 'Referrer gets reward', reward: 'free_month' },
  ],
  shareChannels: ['line', 'whatsapp', 'instagram_stories', 'clipboard'],
} as const

/** UA-018: Social proof configuration */
export const SOCIAL_PROOF_CONFIG = {
  /** Show "X people playing now" notification */
  showActivePlayers: true,
  /** Minimum players to show the notification */
  minPlayersToShow: 5,
  /** Refresh interval (ms) */
  refreshIntervalMs: 60_000,
  /** localStorage key for dismissal */
  dismissKey: 'cheersin-social-proof-dismiss',
} as const

/** UA-019: Re-engagement email sequence (Resend) */
export const REENGAGEMENT_SEQUENCE = [
  { day: 1, subject: 'Your wine profile is ready!', template: 'day1_welcome_back' },
  { day: 3, subject: 'New games added this week', template: 'day3_new_content' },
  { day: 7, subject: 'Your friends are playing — join them!', template: 'day7_social_proof' },
  { day: 14, subject: 'Special offer: 50% off your first month', template: 'day14_discount' },
  { day: 30, subject: 'We miss you! Come back for a free game', template: 'day30_winback' },
] as const

/** UA-020: Seasonal event calendar */
export const SEASONAL_EVENTS = [
  { month: 1, name: 'Chinese New Year Wine Party', theme: 'cny', durationDays: 14 },
  { month: 2, name: "Valentine's Wine & Dine", theme: 'valentine', durationDays: 7 },
  { month: 3, name: 'Spring Wine Festival', theme: 'spring', durationDays: 7 },
  { month: 5, name: "Mother's Day Special", theme: 'mothers_day', durationDays: 3 },
  { month: 6, name: 'Summer Cocktail Season', theme: 'summer', durationDays: 30 },
  { month: 8, name: "Father's Day BBQ & Wine", theme: 'fathers_day', durationDays: 3 },
  { month: 9, name: 'Mid-Autumn Wine Moon', theme: 'mid_autumn', durationDays: 7 },
  { month: 10, name: 'Halloween Mystery Wine', theme: 'halloween', durationDays: 10 },
  { month: 11, name: 'Beaujolais Nouveau Day', theme: 'beaujolais', durationDays: 3 },
  { month: 12, name: 'Holiday Party Season', theme: 'christmas', durationDays: 21 },
] as const

/** UA-021: Loyalty program tiers */
export const LOYALTY_TIERS = [
  { name: 'Bronze', minPoints: 0, perks: ['Basic badge', 'Standard support'] },
  { name: 'Silver', minPoints: 500, perks: ['Silver badge', 'Priority support', '5% discount'] },
  { name: 'Gold', minPoints: 2000, perks: ['Gold badge', 'VIP support', '10% discount', 'Early access'] },
  { name: 'Platinum', minPoints: 5000, perks: ['Platinum badge', 'Concierge support', '15% discount', 'Early access', 'Exclusive events'] },
] as const

/** UA-022: Churn risk indicators */
export const CHURN_INDICATORS = [
  { signal: 'no_login_7d', weight: 3, action: 'Send re-engagement email' },
  { signal: 'no_game_14d', weight: 2, action: 'Push notification with new games' },
  { signal: 'payment_failed', weight: 5, action: 'Payment recovery sequence' },
  { signal: 'support_ticket_open', weight: 1, action: 'Prioritize resolution' },
  { signal: 'cancelled_but_active', weight: 4, action: 'Retention offer' },
  { signal: 'downgraded', weight: 3, action: 'Win-back campaign' },
] as const

/** UA-025: Push notification strategy */
export const PUSH_NOTIFICATION_STRATEGY = {
  maxPerDay: 2,
  maxPerWeek: 5,
  quietHoursStart: 22, // 10pm
  quietHoursEnd: 8,    // 8am
  categories: [
    { type: 'new_content', frequency: 'weekly', priority: 'medium' },
    { type: 'social', frequency: 'realtime', priority: 'high' },
    { type: 'payment', frequency: 'immediate', priority: 'critical' },
    { type: 'promotional', frequency: 'weekly', priority: 'low' },
    { type: 'achievement', frequency: 'realtime', priority: 'medium' },
  ],
} as const

/** UA-026: SEO target keywords */
export const SEO_KEYWORDS = [
  { keyword: '品酒遊戲', volume: 'high', difficulty: 'medium', page: '/games' },
  { keyword: '派對遊戲 app', volume: 'high', difficulty: 'high', page: '/games' },
  { keyword: '靈魂酒測', volume: 'medium', difficulty: 'low', page: '/quiz' },
  { keyword: '品酒課程線上', volume: 'medium', difficulty: 'medium', page: '/learn' },
  { keyword: 'AI 侍酒師', volume: 'low', difficulty: 'low', page: '/assistant' },
  { keyword: '真心話大冒險 線上', volume: 'high', difficulty: 'high', page: '/games/truth-or-dare' },
  { keyword: '劇本殺 線上', volume: 'high', difficulty: 'high', page: '/games/script-murder' },
  { keyword: '紅酒推薦', volume: 'high', difficulty: 'medium', page: '/assistant' },
  { keyword: '派對桌遊推薦', volume: 'medium', difficulty: 'medium', page: '/games' },
  { keyword: '品酒入門', volume: 'medium', difficulty: 'low', page: '/learn' },
] as const

/** UA-027: ASO (App Store Optimization) keywords */
export const ASO_KEYWORDS = {
  primary: ['品酒', '派對遊戲', '真心話大冒險', 'AI 侍酒師'],
  secondary: ['聚會遊戲', '紅酒', '桌遊', '品酒學院'],
  longTail: ['派對遊戲 app 推薦', '線上品酒課程', '聚會破冰遊戲'],
} as const

/** UA-028: Influencer partnership tiers */
export const INFLUENCER_TIERS = [
  { name: 'Nano', followers: '1K-10K', compensation: 'Free premium (3 months)', deliverables: ['1 post', '1 story'] },
  { name: 'Micro', followers: '10K-50K', compensation: 'Free premium (12 months) + NT$3,000', deliverables: ['2 posts', '3 stories', '1 reel'] },
  { name: 'Mid', followers: '50K-200K', compensation: 'Free premium (lifetime) + NT$10,000', deliverables: ['3 posts', '5 stories', '2 reels'] },
  { name: 'Macro', followers: '200K+', compensation: 'Custom partnership', deliverables: ['Custom campaign'] },
] as const

/** UA-031: Upsell trigger points in free tier */
export const UPSELL_TRIGGERS = [
  { trigger: 'ai_limit_reached', location: '/assistant', message: 'Unlock unlimited AI chats with Pro' },
  { trigger: 'room_limit_reached', location: '/games/*', message: 'Upgrade for 8+ player rooms' },
  { trigger: 'game_locked', location: '/games', message: 'This game is Pro-only — upgrade to play' },
  { trigger: 'course_locked', location: '/learn', message: 'Premium courses available with VIP' },
  { trigger: 'ad_shown', location: '*', message: 'Go ad-free with any paid plan' },
  { trigger: 'quiz_deep_results', location: '/quiz', message: 'Get your full 360° profile with Pro' },
] as const

/** UA-032: Competitive analysis matrix */
export const COMPETITORS = [
  { name: 'Vivino', strength: 'Wine database', weakness: 'No games', ourAdvantage: 'Social gaming + AI' },
  { name: 'CellarTracker', strength: 'Expert reviews', weakness: 'No social features', ourAdvantage: 'Multiplayer + learning' },
  { name: 'Houseparty', strength: 'Social gaming', weakness: 'Shut down', ourAdvantage: 'Active + wine theme' },
  { name: 'Jackbox Games', strength: 'Party game quality', weakness: 'Paid per game', ourAdvantage: 'Free tier + subscription' },
  { name: 'Wine Folly', strength: 'Education content', weakness: 'Static content', ourAdvantage: 'Interactive AI + games' },
] as const

/** UA-039: Win-back campaign sequence for dormant users */
export const WINBACK_CAMPAIGN = [
  { day: 0, channel: 'email', offer: null, subject: 'We miss you at Cheersin!' },
  { day: 3, channel: 'push', offer: '20% off', subject: 'Special offer just for you' },
  { day: 7, channel: 'email', offer: '50% off first month', subject: 'Half off — limited time' },
  { day: 14, channel: 'email', offer: 'free_trial_7d', subject: '7 days of Pro — on us' },
  { day: 30, channel: 'email', offer: null, subject: 'One last thing before we go...' },
] as const

/** UA-040: Launch PR press kit metadata */
export const PRESS_KIT = {
  companyName: 'Cheersin 沁飲',
  tagline: '你的 AI 派對靈魂伴侶',
  foundedYear: 2024,
  website: 'https://cheersin.app',
  contactEmail: 'press@cheersin.app',
  socialLinks: {
    instagram: 'https://instagram.com/cheersin.app',
    line: 'https://line.me/ti/p/cheersin',
  },
  keyFacts: [
    'AI-powered wine recommendation engine',
    'Multiplayer party games with wine themes',
    'Interactive wine education courses',
    'Script murder with wine storylines',
    'PWA + Android (TWA) support',
  ],
  logoAssets: {
    primary: '/logo_full_transparent.png',
    icon: '/logo_icon_transparent.png',
    monochrome: '/logo_monochrome_gold.png',
  },
} as const
