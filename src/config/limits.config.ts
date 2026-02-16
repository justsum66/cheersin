export const FREE_TIER_LIMITS = {
    DAILY_AI_MESSAGES: 3,
    MAX_ROOM_PLAYERS: 4,
    MAX_HISTORY_ITEMS: 3,
    CAN_CREATE_ROOM: true, // But limited size
    CAN_USE_ADULT_PACKS: false,
    CAN_DOWNLOAD_PARTY_PLAN: false,
}

export const PRO_TIER_LIMITS = {
    DAILY_AI_MESSAGES: 50, // "Unlimited" in marketing, but capped for safety
    MAX_ROOM_PLAYERS: 12,
    MAX_HISTORY_ITEMS: 50,
    CAN_CREATE_ROOM: true,
    CAN_USE_ADULT_PACKS: true,
    CAN_DOWNLOAD_PARTY_PLAN: true,
}

export const STORAGE_KEYS = {
    DAILY_AI_COUNT: 'cheersin_daily_ai_count',
    DAILY_AI_DATE: 'cheersin_daily_ai_date',
}
