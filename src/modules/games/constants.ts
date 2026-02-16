/**
 * GAMES_500 #270 #252 #279 #284 #292：遊戲內共用文案與常數，供各遊戲一致使用。
 */

/** 載入中按鈕顯示文字 */
export const GAME_LOADING_BUTTON_TEXT = '載入中…'

/** 載入中按鈕 aria-label（螢幕閱讀器） */
export const GAME_BUTTON_LOADING_ARIA = '載入中'

/** GAMES_500 #252：遊戲結束 CTA 統一用詞 */
export const GAME_CTA_PLAY_AGAIN = '再玩一次'
export const GAME_CTA_CHANGE_GAME = '換遊戲'
export const GAME_CTA_BACK_LOBBY = '回大廳'

/** GAMES_500 #279：空狀態（無玩家等）友善文案 */
export const GAME_EMPTY_PLAYERS_TEXT = '請新增至少 2 位玩家'
export const GAME_EMPTY_LIST_TEXT = '尚無項目'

/** GAMES_500 #292：無效輸入提示 */
export const GAME_INVALID_INPUT_PLAYERS = '請新增至少 2 位玩家'
export const GAME_INVALID_INPUT_EMPTY = '請輸入內容'

/** GAMES_500 #284：Toast 顯示時長（ms），遊戲內一致 */
export const GAME_TOAST_DURATION_MS = 2500

/** GAMES_500 #34 #60 #117：多語系 key 預留（目前繁中）；標題／描述／本週熱門 N 次／人數文案 */
export const GAMES_TITLE_I18N_KEY = 'games.title'
export const GAMES_DESCRIPTION_I18N_KEY = 'games.description'
export const GAMES_LOBBY_WEEKLY_PLAYS_I18N_KEY = 'games.lobby.weeklyPlays'
export const GAMES_CARD_PLAYERS_I18N_KEY = 'games.card.players'

/** GAMES_500 #131：RTL 佈局預留（多語系含 RTL 時設為 true） */
export const GAMES_RTL = false

/** GAMES_500 #72：Lobby 區塊順序可 A/B（'default' | 'variant_b'）；目前僅 default */
export const LOBBY_BLOCK_ORDER: 'default' | 'variant_b' = 'default'

/** GAMES_500 #241：各遊戲規則內文統一結構（目標／人數／流程／懲罰）— 供子遊戲對齊 */
export const GAMES_RULES_SECTIONS = ['目標', '人數', '流程', '懲罰'] as const

/** GAMES_500 #243：規則內文可在地化 key 前綴 */
export const GAMES_RULES_I18N_KEY_PREFIX = 'games.rules.'

/** GAMES_500 #92：Lobby 可見文案 i18n key（搜尋、區塊標題、分類 tab） */
export const GAMES_LOBBY_SEARCH_PLACEHOLDER_I18N_KEY = 'games.lobby.searchPlaceholder'
export const GAMES_LOBBY_RECENT_I18N_KEY = 'games.lobby.recent'
export const GAMES_LOBBY_WEEKLY_I18N_KEY = 'games.lobby.weeklyHot'
export const GAMES_LOBBY_RECOMMENDED_I18N_KEY = 'games.lobby.recommended'
export const GAMES_LOBBY_CATEGORY_ALL_I18N_KEY = 'games.lobby.category.all'
export const GAMES_LOBBY_CATEGORY_CLASSIC_I18N_KEY = 'games.lobby.category.classic'
export const GAMES_LOBBY_CATEGORY_VS_I18N_KEY = 'games.lobby.category.vs'
export const GAMES_LOBBY_CATEGORY_RANDOM_I18N_KEY = 'games.lobby.category.random'
export const GAMES_LOBBY_CATEGORY_TWO_I18N_KEY = 'games.lobby.category.two'
