import { HERO_SUBTITLE_VARIANTS, HOME_FEATURES_LABEL } from '@/config/home.config'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'
import { COPY_CTA_IMMEDIATE_QUIZ } from '@/config/copy.config'

/** Phase 2 Task 21-25：多語預留；重新定位為「派對救星」— 用語一致「派對」「30 秒」「嗨翻」 */
export const HOME_COPY = {
    heroTitle1: '派對救星',
    heroTitle2: '30秒嗨翻全場',
    /** H04：副標由 config 驅動，HOME_COPY 保留相容 */
    heroSubtitle: HERO_SUBTITLE_VARIANTS[0],
    heroSubtitleB: HERO_SUBTITLE_VARIANTS[1],
    /** Phase 2 Task 21：主 CTA 強調 30 秒開始 */
    ctaQuiz: '30 秒找到你的酒',
    ctaQuizHint: '免費 · 超快 · 精準推薦',
    ctaAssistant: 'AI 派對幫手',
    ctaGames: '派對遊樂場',
    ctaBadge: '🔥 限時免費',
    featuresLabel: HOME_FEATURES_LABEL,
    featuresTitle: '一站搞定你的派對',
    featuresDesc: '選遊戲、配酒款、排流程 — 30 秒到嗨翻，AI 幫你搞定一切。不喝酒也能嗨。',
    statsTrust: `${SOCIAL_PROOF_USER_COUNT.toLocaleString('en-US')}+ 派對主持人都在用 Cheersin`,
    ctaFooterTitle: '30 秒嗨翻全場',
    ctaFooterDesc: '免費方案永久有效。升級 Pro 解鎖 12 人大房、18+ 內容、無限 AI 助手。',
    ctaFooterButton: COPY_CTA_IMMEDIATE_QUIZ,
} as const
