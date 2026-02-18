/**
 * UA-001~012: 100-Persona Framework — User personas with attraction scores
 * Used for analytics segmentation, onboarding personalization, and monetization targeting.
 */

export interface UserPersona {
  id: string
  name: string
  ageRange: string
  /** Estimated percentage of user base */
  pctOfUsers: number
  /** Primary motivation for using the app */
  motivation: string
  /** Key question: will this persona pay? */
  willPay: 'high' | 'medium' | 'low'
  /** Features most attractive to this persona */
  topFeatures: string[]
  /** Best onboarding path */
  onboardingPath: 'quiz' | 'games' | 'learn' | 'assistant'
  /** Conversion trigger — what makes them upgrade */
  conversionTrigger: string
}

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'party_host',
    name: 'Party Host',
    ageRange: '21-35',
    pctOfUsers: 15,
    motivation: 'Needs fun party games for gatherings',
    willPay: 'high',
    topFeatures: ['Party games', 'Room multiplayer', 'Game variety'],
    onboardingPath: 'games',
    conversionTrigger: 'Hit 2-player room limit, wants 8+ players',
  },
  {
    id: 'wine_beginner',
    name: 'Wine Enthusiast Beginner',
    ageRange: '25-40',
    pctOfUsers: 10,
    motivation: 'Wants to learn about wine in a fun way',
    willPay: 'medium',
    topFeatures: ['Soul wine quiz', 'AI sommelier', 'Wine courses'],
    onboardingPath: 'quiz',
    conversionTrigger: 'Runs out of free AI chats, wants unlimited',
  },
  {
    id: 'wine_pro',
    name: 'Wine Professional / Sommelier',
    ageRange: '30-50',
    pctOfUsers: 5,
    motivation: 'Professional tool for pairing and knowledge',
    willPay: 'high',
    topFeatures: ['Advanced courses', 'Expert consultation', 'AI sommelier'],
    onboardingPath: 'assistant',
    conversionTrigger: 'Needs pro-level course content and expert access',
  },
  {
    id: 'college_social',
    name: 'College Student Social',
    ageRange: '18-24',
    pctOfUsers: 15,
    motivation: 'Fun social games for dorm/party',
    willPay: 'low',
    topFeatures: ['Free games', 'Truth or Dare', 'Quick play'],
    onboardingPath: 'games',
    conversionTrigger: 'Wants more game variety or larger rooms',
  },
  {
    id: 'couple_date',
    name: 'Couple Date Night',
    ageRange: '25-40',
    pctOfUsers: 10,
    motivation: 'Wine and games for date night',
    willPay: 'medium',
    topFeatures: ['2-player games', 'Wine quiz', 'AI recommendations'],
    onboardingPath: 'quiz',
    conversionTrigger: 'Wants ad-free romantic experience',
  },
  {
    id: 'bar_owner',
    name: 'Bar / Restaurant Owner',
    ageRange: '30-55',
    pctOfUsers: 5,
    motivation: 'Entertainment for customers, staff training',
    willPay: 'high',
    topFeatures: ['Team plans', 'Custom branding', 'Game hosting'],
    onboardingPath: 'games',
    conversionTrigger: 'Needs team/enterprise plan for staff',
  },
  {
    id: 'corporate_team',
    name: 'Corporate Team Building',
    ageRange: '25-45',
    pctOfUsers: 10,
    motivation: 'Team building activities with wine theme',
    willPay: 'high',
    topFeatures: ['Large rooms', 'Script murder', 'Team plans'],
    onboardingPath: 'games',
    conversionTrigger: 'Needs 12+ player rooms and custom events',
  },
  {
    id: 'casual_gamer',
    name: 'Casual Mobile Gamer',
    ageRange: '20-35',
    pctOfUsers: 10,
    motivation: 'Quick fun games to pass time',
    willPay: 'low',
    topFeatures: ['Quick games', 'Leaderboards', 'Daily challenges'],
    onboardingPath: 'games',
    conversionTrigger: 'Wants ad-free experience and exclusive games',
  },
  {
    id: 'wine_collector',
    name: 'Wine Collector',
    ageRange: '35-60',
    pctOfUsers: 5,
    motivation: 'Rare wine discovery and community',
    willPay: 'high',
    topFeatures: ['Premium courses', 'Expert access', 'Rare wine sourcing'],
    onboardingPath: 'learn',
    conversionTrigger: 'Wants VIP wine tasting events and rare bottle access',
  },
  {
    id: 'content_creator',
    name: 'Content Creator / KOL',
    ageRange: '20-35',
    pctOfUsers: 5,
    motivation: 'Shareable content for social media',
    willPay: 'medium',
    topFeatures: ['Shareable results', 'Unique quizzes', 'Visual cards'],
    onboardingPath: 'quiz',
    conversionTrigger: 'Wants exclusive content and early access',
  },
  {
    id: 'parent_family',
    name: 'Parent (Family Game Night)',
    ageRange: '30-50',
    pctOfUsers: 5,
    motivation: 'Family-friendly entertainment',
    willPay: 'medium',
    topFeatures: ['Safe games', 'Educational content', 'Family mode'],
    onboardingPath: 'games',
    conversionTrigger: 'Wants larger room for family gatherings',
  },
  {
    id: 'tourist',
    name: 'International Tourist',
    ageRange: '25-45',
    pctOfUsers: 5,
    motivation: 'Discover local wine culture',
    willPay: 'medium',
    topFeatures: ['Multi-language', 'Local recommendations', 'AI guide'],
    onboardingPath: 'assistant',
    conversionTrigger: 'Wants personalized wine region recommendations',
  },
]

/** UA-014: Feature-to-persona payment driver matrix */
export const FEATURE_PAYMENT_DRIVERS: Record<string, string[]> = {
  party_host: ['room_player_limit', 'game_variety', 'ad_free'],
  wine_beginner: ['unlimited_ai_chat', 'advanced_quiz', 'course_access'],
  wine_pro: ['expert_consultation', 'pro_courses', 'rare_wine_access'],
  college_social: ['game_variety', 'room_player_limit', 'ad_free'],
  couple_date: ['ad_free', 'exclusive_games', 'wine_recommendations'],
  bar_owner: ['team_plan', 'custom_branding', 'analytics'],
  corporate_team: ['large_rooms', 'team_plan', 'event_hosting'],
  casual_gamer: ['ad_free', 'exclusive_games', 'leaderboards'],
  wine_collector: ['vip_events', 'rare_wine_sourcing', 'expert_access'],
  content_creator: ['exclusive_content', 'early_access', 'shareable_results'],
  parent_family: ['family_mode', 'larger_rooms', 'safe_content'],
  tourist: ['multi_language', 'local_recs', 'offline_mode'],
}
