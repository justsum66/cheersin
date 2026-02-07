/**
 * 遊戲定義（metadata）：id、名稱、描述、圖示、顏色、人數、熱門、分類。
 * 供 Lobby、GamesPageClient、GameWrapper 使用；實際組件由 GameLazyMap 延遲載入。
 */

import type { LucideIcon } from 'lucide-react'
import type { SubscriptionTier } from '@/lib/subscription'
import {
  MessageCircle,
  RotateCw,
  RotateCcw,
  Target,
  Dices,
  Hand,
  Crown,
  Layers,
  MoveVertical,
  Timer,
  Sparkles,
  CircleCheck,
  Gauge,
  ArrowUpDown,
  Ship,
  UserCheck,
  HandMetal,
  Shuffle,
  List,
  Coins,
  CircleDot,
  Eye,
  Moon,
  Activity,
  Smile,
  Heart,
  Theater,
  GitCompare,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Users,
  Flame,
  Music2,
  Wine,
  Ban,
  Link2,
  FileQuestion,
  Zap,
  Spade,
  Skull,
  Bomb,
  Brain,
  Lock,
  Dice6,
  User,
  Utensils,
  Pencil,
  Search,
  Calculator,
  Palette,
  Music,
  Type,
  DollarSign,
  MessageCircleQuestion,
  Mic,
  Clover,
  Clock,
  Star,
  HelpCircle,
  Ear,
} from 'lucide-react'

/** 任務 8：遊戲難度標籤 */
export type GameDifficulty = 'easy' | 'medium' | 'hard'

/** 單一遊戲 metadata（不含 component）；任務 8/9：難度、時長預估；T072：兩人友善；GAMES_500 #127：規則摘要 hover 預覽 */
export interface GameMeta {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: 'primary' | 'secondary' | 'accent' | 'white'
  players: string
  popular?: boolean
  /** 任務 8：上手難度 */
  difficulty?: GameDifficulty
  /** 任務 9：每局約幾分鐘 */
  estimatedMinutes?: number
  /** 任務 5：搜尋用拼音首字母或關鍵字，匹配即顯示 */
  searchKeys?: string
  /** T072 P2：兩人遊戲入口 — 2 人即可玩、情侶約會友善 */
  twoPlayerFriendly?: boolean
  /** GAMES_500 #127：卡片 hover 時顯示的規則摘要（可選，一兩句） */
  rulesSummary?: string
  /** G0.5：付費遊戲所需訂閱等級（不設即免費） */
  requiredTier?: SubscriptionTier
}

/** 遊戲分類：派對／反應／猜數字／抽籤／其他／同桌對視／18+辣味。供 Lobby 篩選。 */
export type GameCategory = 'party' | 'reaction' | 'guess' | 'draw' | 'other' | 'facetoface' | 'adult'

/** 遊戲分類標籤文案 */
export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
  party: '經典派對',
  reaction: '反應測試',
  guess: '競技對決',
  draw: '隨機選人',
  facetoface: '2人專屬',
  adult: '18+辣味',
  other: '其他',
}

/** 任務 8：難度標籤文案 */
export const GAME_DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
}

/** 遊戲列表（順序即 Lobby 顯示順序）；任務 8/9：難度、每局約分鐘 */
export const GAMES_META: GameMeta[] = [
  { id: 'truth-or-dare', name: '真心話大冒險', description: '經典派對遊戲，揭開秘密或接受挑戰。', icon: MessageCircle, color: 'primary', players: '2-10 人', popular: true, difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'zxhdmx zhenxinhuadamaoxian', twoPlayerFriendly: true },
  { id: 'roulette', name: '命運轉盤', description: '命運指針決定誰來喝一口。可自訂玩家名稱！', icon: RotateCw, color: 'secondary', players: '2-12 人', popular: true, difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'myzp mingyunzhuanpan', twoPlayerFriendly: true, rulesSummary: '指針轉到誰，誰喝一口。可自訂玩家名單。' },
  { id: 'trivia', name: '酒神隨堂考', description: '考驗酒類知識，答錯請喝！', icon: Target, color: 'accent', players: '1-6 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'jsstk jiushensuitangkao', twoPlayerFriendly: true },
  { id: 'dice', name: '深空骰子', description: '3D 數位擲骰，簡單暴力的比大小。', icon: Dices, color: 'white', players: '無限', difficulty: 'easy', estimatedMinutes: 3, searchKeys: 'sksz shenkongshaizi', twoPlayerFriendly: true },
  { id: 'never-have-i-ever', name: '我從來沒有', description: '經典酒桌告白遊戲，做過就喝！', icon: Hand, color: 'primary', players: '3-10 人', popular: true, difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'wclmy woonglaimeiyou' },
  { id: 'kings-cup', name: '國王遊戲', description: '抽牌決定命運，抽到國王喝一口（懲罰可自訂）。', icon: Crown, color: 'accent', players: '4-10 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'gwyx guowangyouxi' },
  { id: 'baskin-robbins-31', name: '31 遊戲', description: '輪流數 1～31，一次 1～3 個數，喊到 31 喝。', icon: Layers, color: 'secondary', players: '2-6 人', difficulty: 'medium', estimatedMinutes: 8, searchKeys: '31 youxi', twoPlayerFriendly: true },
  { id: 'up-down-stairs', name: '上下樓梯', description: '依樓層順序喊，喊錯或慢的人喝。', icon: MoveVertical, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 8, searchKeys: 'sxlt shangxialouti' },
  { id: 'countdown-toast', name: '倒數乾杯', description: '隨機 3～10 秒倒數，最接近 0 秒按的人喝。', icon: Timer, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'dsgb daoshuganbei', twoPlayerFriendly: true },
  { id: 'random-picker', name: '隨機選一位', description: '純數位抽籤，無實物。', icon: Sparkles, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 3, searchKeys: 'sjxyw suijixuanywei', twoPlayerFriendly: true },
  { id: 'drink-or-safe', name: '喝或安全', description: '抽一位＋喝或安全。', icon: CircleCheck, color: 'secondary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'haq hehuoanquan', twoPlayerFriendly: true },
  { id: 'high-low', name: '比大小', description: '猜下一張比現在大還是小，猜錯喝。', icon: ArrowUpDown, color: 'secondary', players: '2-6 人', difficulty: 'easy', estimatedMinutes: 8, twoPlayerFriendly: true },
  { id: 'titanic', name: '浮杯', description: '輪流加一點，讓杯子沉的人喝。', icon: Ship, color: 'secondary', players: '2-6 人', difficulty: 'medium', estimatedMinutes: 10, twoPlayerFriendly: true },
  { id: 'finger-guessing', name: '猜拳', description: '經典猜拳，輸的人喝。', icon: HandMetal, color: 'secondary', players: '2 人', difficulty: 'easy', estimatedMinutes: 3, twoPlayerFriendly: true },
  { id: 'name-train', name: '名字接龍', description: '輪流喊下一個人名字，喊錯或慢喝。', icon: List, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 8 },
  { id: 'liar-dice', name: '吹牛骰子', description: '猜總點數低／中／高，猜錯喝。', icon: Coins, color: 'white', players: '2-6 人', difficulty: 'medium', estimatedMinutes: 10, twoPlayerFriendly: true },
  { id: 'coin-flip', name: '拋硬幣', description: '猜正面或反面，猜錯喝。', icon: CircleDot, color: 'secondary', players: '1+ 人', difficulty: 'easy', estimatedMinutes: 3, twoPlayerFriendly: true },
  { id: 'who-is-undercover', name: '誰是臥底', description: '分配詞語、輪流描述、投票揭曉臥底。', icon: Eye, color: 'primary', players: '3-10 人', difficulty: 'hard', estimatedMinutes: 15 },
  { id: 'werewolf-lite', name: '狼人殺簡化版', description: '4-8 人快速酒桌版，狼人／村民／預言家。', icon: Moon, color: 'secondary', players: '4-8 人', difficulty: 'hard', estimatedMinutes: 20 },
  { id: 'heartbeat-challenge', name: '心跳大挑戰', description: '猜指定玩家心跳速度，最遠者喝。', icon: Activity, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 8, twoPlayerFriendly: true },
  { id: 'mimic-face', name: '表情模仿', description: '抽表情用前鏡頭模仿，最低分喝。', icon: Smile, color: 'primary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, twoPlayerFriendly: true },
  { id: 'chemistry-test', name: '默契大考驗', description: '兩人同時答同一題，答案相同則安全。', icon: Heart, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, twoPlayerFriendly: true },
  { id: 'charades', name: '比手畫腳', description: '一人比劃多人猜，猜錯喝酒。', icon: Theater, color: 'secondary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, twoPlayerFriendly: true },
  { id: 'would-you-rather', name: '終極二選一', description: '兩難選擇，選少數的人喝。', icon: GitCompare, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, twoPlayerFriendly: true },

  { id: 'punishment-wheel', name: '懲罰轉盤', description: '輸家轉動懲罰輪盤，等級／超級懲罰／豁免券。', icon: AlertTriangle, color: 'secondary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 5, twoPlayerFriendly: true },
  { id: 'who-most-likely', name: '誰最可能', description: '閨蜜八卦遊戲，大家同時指向最符合的人。', icon: Users, color: 'primary', players: '2-10 人', difficulty: 'easy', estimatedMinutes: 8, twoPlayerFriendly: true },
  { id: 'secret-reveal', name: '秘密爆料', description: '輪流講秘密，其他人猜真假；猜錯喝、說謊被抓喝兩倍。', icon: MessageSquare, color: 'secondary', players: '2-10 人', difficulty: 'medium', estimatedMinutes: 12, twoPlayerFriendly: true },
  { id: 'thirteen-cards', name: '十三張比大小', description: '每人 13 張排 3/5/5 墩，與系統比大小，輸幾墩喝幾口。', icon: Layers, color: 'accent', players: '1+ 人', difficulty: 'hard', estimatedMinutes: 15, twoPlayerFriendly: true },
  { id: 'blackjack', name: '21 點', description: '經典 21 點，莊家 17 停牌；爆牌或輸局喝一口（可自訂）。', icon: Coins, color: 'primary', players: '1+ 人', difficulty: 'medium', estimatedMinutes: 15, twoPlayerFriendly: true },
  { id: 'hot-potato', name: '熱土豆', description: '倒數傳手機，0 秒時拿著的人喝。', icon: Flame, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'rtd redoutou', twoPlayerFriendly: true, rulesSummary: '隨機倒數，傳給下一位；0 秒時持有者喝。' },
  { id: 'seven-tap', name: '七拍', description: '跟節奏點 7 下，脫拍的人喝。', icon: Music2, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'qp qipai', twoPlayerFriendly: true, rulesSummary: '7 秒內點滿 7 下即過關，未滿或超時喝。' },
  { id: 'spin-bottle', name: '數位真心話瓶', description: '瓶口指到的人選真心話或大冒險。', icon: RotateCcw, color: 'secondary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'szxhb shuweizhenxinhuaping', twoPlayerFriendly: true, rulesSummary: '轉瓶指到誰，誰選真心話或大冒險。' },
  { id: 'dare-dice', name: '大冒險骰', description: '擲 1～6 對應懲罰等級，抽一題大冒險。', icon: Dices, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'dmx damaoxianshai', twoPlayerFriendly: true, rulesSummary: '擲骰決定等級，抽一題大冒險執行。' },

  { id: 'toast-relay', name: '乾杯接力', description: '輪流說一個詞接龍，卡住或重複喝。', icon: BookOpen, color: 'secondary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'gbjl ganbeijieli', twoPlayerFriendly: true, rulesSummary: '輪流接龍，卡住或重複喝。' },
  { id: 'number-bomb', name: '數字炸彈', description: '1～100 藏著炸彈，輪流猜數字縮小範圍，猜中炸彈的人喝！', icon: AlertTriangle, color: 'accent', players: '2-8 人', popular: true, difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'szzd shuzizhadad bomb', twoPlayerFriendly: true, rulesSummary: '猜數字縮小範圍，踩到炸彈的人喝。' },
  { id: '369-clap', name: '369拍手', description: '從 1 開始數，遇到 3/6/9 不能說要拍手，拍錯或說錯的人喝！', icon: Hand, color: 'primary', players: '2-8 人', popular: true, difficulty: 'medium', estimatedMinutes: 5, searchKeys: '369 sanliu jiu paishou clap', twoPlayerFriendly: true, rulesSummary: '遇到 3/6/9 要拍手不能說數字，拍錯喝。' },
  { id: 'buzz-game', name: 'Buzz禁語', description: '遇到特定數字的倍數或包含該數字時要說 Buzz，說錯的人喝！', icon: Ban, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 5, searchKeys: 'buzz jinyu forbidden', twoPlayerFriendly: true, rulesSummary: '遇到禁語數字的倍數或包含它時要說 Buzz。' },
  { id: 'category-chain', name: '分類接龍', description: '選定分類（動物/食物/明星）輪流說同類的詞，不能重複！卡住喝。', icon: Link2, color: 'secondary', players: '2-8 人', popular: true, difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'fenleijielongd category chain', twoPlayerFriendly: true, rulesSummary: '選分類輪流說同類詞，不能重複卡住喝。' },
  { id: 'two-truths-one-lie', name: '兩真一假', description: '說兩件真事一件假事，其他人猜哪個是假的，猜錯喝！', icon: FileQuestion, color: 'primary', players: '3-10 人', popular: true, difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'liangzhenyijia two truths lie', rulesSummary: '說兩真一假，其他人猜假話，猜錯喝。' },
  { id: 'spicy-truth-or-dare', name: '辣味真心話大冒險', description: '🔞 18+ 成人版真心話大冒險，更勁爆更刺激！', icon: Flame, color: 'primary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'spicy truth dare 18+ adult lawei', rulesSummary: '18+ 成人版真心話大冒險。' },
  { id: 'spicy-never-have-i-ever', name: '辣味我從來沒有', description: '🔞 18+ 成人版我從來沒有，做過的人喝！', icon: Flame, color: 'accent', players: '3-10 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'spicy never have ever 18+ adult lawei', rulesSummary: '18+ 我從來沒有，做過喝。' },
  { id: 'spicy-who-most-likely', name: '辣味誰最可能', description: '🔞 18+ 成人版誰最可能，被最多人指的喝！', icon: Flame, color: 'secondary', players: '3-10 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'spicy who likely 18+ adult lawei', rulesSummary: '18+ 誰最可能，被指最多喝。' },
  // Phase 2 新遊戲

  { id: 'between-cards', name: '射龍門', description: '猜第三張牌是否在前兩張之間，撞柱喝雙倍！', icon: Spade, color: 'primary', players: '2-6 人', popular: true, difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'shelongmen between cards poker', twoPlayerFriendly: true, rulesSummary: '猜中間牌在範圍內否，撞柱喝雙倍。' },
  { id: 'russian-roulette', name: '俄羅斯輪盤', description: '經典六選一！中彈的人喝酒！', icon: Target, color: 'accent', players: '2-6 人', popular: true, difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'eluosi lunpan russian roulette', twoPlayerFriendly: true, rulesSummary: '6發1彈，中彈喝酒。' },
  { id: 'couple-test', name: '情侶默契測試', description: '測試你們有多了解對方！答錯喝酒！', icon: Heart, color: 'primary', players: '2 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'qinglv moqi couple test', twoPlayerFriendly: true, rulesSummary: '測試情侶默契，答錯喝。' },
  { id: 'soul-mate', name: '心有靈犀', description: '兩人同時選一個選項，選一樣安全、不一樣喝！', icon: Heart, color: 'accent', players: '2 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'xinyoulingxi soul mate telepathy', twoPlayerFriendly: true, rulesSummary: '同時選選項，一樣安全不一樣喝。' },
  { id: 'spicy-would-you-rather', name: '辣味終極二選一', description: '🔞 18+ 成人版二選一，更勁爆的選擇！', icon: Flame, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'spicy would rather 18+ adult lawei', rulesSummary: '18+ 二選一，必須選不能跳過。' },
  { id: 'paranoia-game', name: '偏執遊戲', description: '提問者選人，被選中者可喝酒揭曉問題！', icon: Eye, color: 'secondary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'pianzhiyouxi paranoia', rulesSummary: '選人後被選者可喝酒揭曉問題。' },
  { id: 'secret-confession', name: '禁忌告白', description: '匿名告白，其他人猜是誰！猜錯喝酒！', icon: Lock, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'jinjigaobai confession secret', rulesSummary: '匿名告白猜是誰，猜錯喝。' },
  { id: 'dare-cards', name: '大膽挑戰', description: '抽挑戰卡！完成或喝酒！', icon: Sparkles, color: 'accent', players: '2-8 人', popular: true, difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'dadantiaozhang dare cards challenge', twoPlayerFriendly: true, rulesSummary: '抽挑戰卡執行或喝酒。' },
  { id: 'mind-reading', name: '讀心術', description: '猜測他人的選擇！猜錯喝酒！', icon: Sparkles, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'duxinshu mind reading guess', rulesSummary: '猜對方選擇，猜錯喝。' },
  { id: 'spicy-dice', name: '情趣骰子', description: '🔞 18+ 情侶專屬骰子！擲骰決定動作！', icon: Dice6, color: 'accent', players: '2 人', difficulty: 'easy', estimatedMinutes: 15, searchKeys: 'qingqu shaizi spicy dice 18+ adult', twoPlayerFriendly: true, rulesSummary: '18+ 情侶骰子，擲骰決定動作。' },
  // Phase 3 新遊戲
  { id: 'reaction-master', name: '反應大師', description: '看到顏色快速點擊！最慢或點錯喝酒！', icon: Activity, color: 'accent', players: '2-4 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'fanying dashi reaction master color', twoPlayerFriendly: true, rulesSummary: '看到顏色快點，最慢或錯誤喝。' },
  { id: 'drunk-truth', name: '酒後吐真言', description: '微醛狀態說出真心話！拒絕回答喝兩杯！', icon: Wine, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'jiuhou tuzhenyan drunk truth', rulesSummary: '微醛說真話，拒絕喝兩杯。' },
  { id: 'late-night', name: '深夜食堂', description: '輪流分享美食話題！最少讚喝酒！', icon: Utensils, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'shenye shitang late night food', twoPlayerFriendly: true, rulesSummary: '分享美食話題，最少讚喝。' },
  // Phase 4 新遊戲
  { id: 'drinking-word', name: '酒令文字', description: '猜酒類相關詞語！猜對得分猜錯喝！', icon: Wine, color: 'primary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'jiuling wenzi drinking word', twoPlayerFriendly: true, rulesSummary: '猜酒類詞語，猜對得分。' },
  { id: 'guess-song', name: '猜歌名', description: '唱歌詞或哼旋律讓大家猜！', icon: Music2, color: 'secondary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'caigeming guess song music', rulesSummary: '唱歌讓別人猜歌名。' },
  { id: 'photo-guess', name: '看圖猜謎', description: '看 Emoji 組合猜答案！', icon: Smile, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'kantucaimi photo guess emoji', twoPlayerFriendly: true, rulesSummary: '看 Emoji 猜答案。' },
  { id: 'word-chain', name: '文字接龍', description: '用上一個詞的最後一個字接新詞！', icon: Link2, color: 'primary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'wenzijielongd word chain', twoPlayerFriendly: true, rulesSummary: '文字接龍，接不出喝。' },
  { id: 'team-guess', name: '團隊猜謎', description: '兩隊輪流競賽！一人比劃其他人猜！', icon: Users, color: 'secondary', players: '4-10 人', difficulty: 'medium', estimatedMinutes: 20, searchKeys: 'tuandui caimi team guess charades', rulesSummary: '分隊比劃猜謎。' },
  { id: 'balance-game', name: '天秤遊戲', description: '猜哪邊比較重／多／大！', icon: Activity, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'tianping balance game', twoPlayerFriendly: true, rulesSummary: '猜哪邊比較重。' },
  { id: 'fortune-draw', name: '命運抽籤', description: '抽取你的運勢籤！運勢決定懲罰！', icon: Sparkles, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'mingyun chouqian fortune draw', twoPlayerFriendly: true, rulesSummary: '抽運勢籤決定懲罰。' },
  { id: 'truth-wheel', name: '真心話轉盤', description: '轉盤選出回答者，拒絕回答喝兩杯！', icon: RotateCcw, color: 'secondary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'zhenxinhua zhuanpan truth wheel', rulesSummary: '轉盤選人回答真心話。' },

  { id: 'photo-bomb', name: '照片炸彈', description: '擺出指定表情拍照，大家投票！', icon: Smile, color: 'secondary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'zhaopian zhadan photo bomb', rulesSummary: '擺表情拍照投票。' },
  // Phase 5 新遊戲
  { id: 'draw-guess', name: '你畫我猜', description: '一人畫圖，其他人猜！', icon: Pencil, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'nihua wocai draw guess', rulesSummary: '畫圖讓別人猜。' },
  { id: 'taboo', name: '禁語猜詞', description: '描述詞語但不能說禁語！', icon: Ban, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'jinyu caci taboo', rulesSummary: '描述詞語不能說禁語。' },
  { id: 'spot-diff', name: '大家來找碴', description: '找出不一樣的那個！', icon: Search, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'dajia laizhaocha spot diff', twoPlayerFriendly: true, rulesSummary: '找出不同的圖案。' },
  { id: 'quick-math', name: '快速心算', description: '限時心算挑戰！答錯喝酒！', icon: Calculator, color: 'secondary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'kuaisu xinsuan quick math', twoPlayerFriendly: true, rulesSummary: '限時心算挑戰。' },
  { id: 'color-blind', name: '色盲測試', description: '看文字選顏色，考驗你的眼力！', icon: Palette, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'semang ceshi color blind', twoPlayerFriendly: true, rulesSummary: '看文字選正確顏色。' },

  { id: 'finger-point', name: '手指快指', description: '看到方向快速指！最慢喝酒！', icon: HandMetal, color: 'secondary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'shouzhi kuaizhi finger point', rulesSummary: '看方向快指，最慢喝。' },
  { id: 'shot-roulette', name: 'Shot輪盤', description: '轉動輪盤決定命運！可能Shot、安全、或反轉！', icon: Target, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'shot lunpan roulette', twoPlayerFriendly: true, rulesSummary: '轉輪盤決定Shot命運。' },
  { id: 'music-chair', name: '搶位遊戲', description: '音樂停止搶位子！沒搶到喀淑！', icon: Music2, color: 'primary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 15, searchKeys: 'qiangwei youxi music chair', rulesSummary: '音樂停止搶位子。' },
  { id: 'bottle-cap', name: '瓶蓋彈射', description: '瞵準目標彈射瓶蓋！脫靶喝酒！', icon: Target, color: 'secondary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'pinggai danshe bottle cap', twoPlayerFriendly: true, rulesSummary: '彈瓶蓋射目標。' },
  // Phase 6 新遊戲

  { id: 'emotion-read', name: '表情讀心', description: '看表情猜情緒！選錯的人喝酒！', icon: Smile, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'biaoqing duxin emotion read', twoPlayerFriendly: true, rulesSummary: '看表情猜情緒。' },
  { id: 'fast-type', name: '打字比賽', description: '限時打字挑戰！準確率低於80%要喝酒！', icon: Type, color: 'secondary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'dazi bisai fast type', twoPlayerFriendly: true, rulesSummary: '限時打字準確率挑戰。' },
  { id: 'dice-war', name: '骰子大戰', description: '雙方各擲兩顆骰子，點數大的獲勝！輸的喝酒！', icon: Dices, color: 'accent', players: '2 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'touzi dazhan dice war', twoPlayerFriendly: true, rulesSummary: '擲骰子比大小。' },
  { id: 'price-guess', name: '價格猜猜', description: '猜物品價格！誤差超過30%要喝酒！', icon: DollarSign, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'jiage caicai price guess', twoPlayerFriendly: true, rulesSummary: '猜物品價格。' },
  { id: 'tongue-challenge', name: '口技挑戰', description: '唔出繞口令！其他玩家投票判定成功或失敗！', icon: Mic, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'kouji tiaozhan tongue challenge', rulesSummary: '唔繞口令投票判定。' },
  { id: 'imitate-me', name: '模仿我', description: '模仿指定對象！其他玩家投票評分！不及格喝酒！', icon: User, color: 'secondary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'mofang wo imitate me', rulesSummary: '模仿指定對象投票評分。' },

  { id: 'lucky-draw', name: '幸運抽抽', description: '抽籤決定運勢！凶籤要喝酒！', icon: Clover, color: 'primary', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'xingyun chouchou lucky draw', twoPlayerFriendly: true, rulesSummary: '抽運勢籤決定喝酒。' },
  { id: 'time-freeze', name: '時間凍結', description: '不看畫面，心裡數秒後按停！越接近目標越高分！', icon: Clock, color: 'accent', players: '2-8 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'shijian dongjie time freeze', twoPlayerFriendly: true, rulesSummary: '心裡數秒按停，比準確度。' },
  { id: 'stare-contest', name: '竀眼大賽', description: '雙方對視！先眨眼的人輸，要喝酒！', icon: Eye, color: 'secondary', players: '2 人', difficulty: 'easy', estimatedMinutes: 5, searchKeys: 'dengyan dasai stare contest', twoPlayerFriendly: true, rulesSummary: '對視比賽，先眨眼喝。' },
  { id: 'bluffing', name: '吹功大法', description: '吹噓自己的能力！其他人投票是否相信！被拆穿就喝酒！', icon: Star, color: 'primary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'chuigong dafa bluffing', rulesSummary: '吹噓能力，被質疑喝酒。' },
  // Phase 7 新遊戲
  { id: 'telephone', name: '傳話遊戲', description: '悄悄話傳遞，看看訊息會變成什麼樣子！', icon: MessageCircle, color: 'primary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 10, searchKeys: 'chuanhua youxi telephone message', rulesSummary: '悄悄話傳遞遊戲。' },
  { id: 'finish-lyric', name: '接歌詞', description: '看歌詞猜歌名！猜錯喝酒！', icon: Music2, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'jie geci finish lyric', twoPlayerFriendly: true, rulesSummary: '看歌詞猜歌名。' },
  { id: 'tic-tac-shot', name: '井字射擊', description: '射中目標獲勝，射空安全！', icon: Target, color: 'secondary', players: '2 人', difficulty: 'easy', estimatedMinutes: 8, searchKeys: 'jingzi sheji tic tac shot', twoPlayerFriendly: true, rulesSummary: '井字棋射擊版。' },
  { id: 'compliment-battle', name: '讚美大戰', description: '互相讚美，由大家投票選出最棒的！', icon: Heart, color: 'primary', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 15, searchKeys: 'zanmei dazhan compliment battle', rulesSummary: '互相讚美投票遊戲。' },
  { id: 'cocktail-mix', name: '調酒大師', description: '考驗你的調酒知識！', icon: Wine, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 12, searchKeys: 'tiaojiao dashi cocktail mix', twoPlayerFriendly: true, rulesSummary: '調酒知識問答。' },
  { id: 'reverse-say', name: '反向指令', description: '聽指令做相反動作！', icon: RotateCcw, color: 'secondary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'fanxiang zhiling reverse say', twoPlayerFriendly: true, rulesSummary: '反向執行指令。' },
  { id: 'riddle-guess', name: '猜謎語', description: '考驗你的智慧和想像力！', icon: HelpCircle, color: 'primary', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 12, searchKeys: 'caimi yu riddle guess', twoPlayerFriendly: true, rulesSummary: '傳統謎語猜測。' },
  { id: 'story-chain', name: '故事接龍', description: '發揮創意，共同編織精彩故事！', icon: BookOpen, color: 'accent', players: '3-8 人', difficulty: 'easy', estimatedMinutes: 15, searchKeys: 'gushi jielong story chain', rulesSummary: '創意故事接龍。' },
  // Phase 8 新遊戲
  { id: 'sound-imitate', name: '聲音模仿', description: '模仿各種聲音，讓大家猜猜是誰！', icon: Mic, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'shengyin mofang sound imitate', rulesSummary: '模仿聲音讓大家猜。' },
  { id: 'emoji-puzzle', name: '表情拼圖', description: '看Emoji猜答案，考驗你的想像力！', icon: Smile, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 12, searchKeys: 'biaoqing pin tu emoji puzzle', twoPlayerFriendly: true, rulesSummary: '看Emoji組合猜答案。' },
  { id: 'memory-match', name: '記憶配對', description: '翻牌配對遊戲，考驗你的記憶力！', icon: Brain, color: 'primary', players: '2-4 人', difficulty: 'medium', estimatedMinutes: 10, searchKeys: 'jiyi peidui memory match', twoPlayerFriendly: true, rulesSummary: '翻牌配對考驗記憶。' },
  { id: 'dance-battle', name: '舞蹈對決', description: '展現你的舞技，爭奪舞蹈之王！', icon: Music, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'wudao duijue dance battle', rulesSummary: '舞蹈動作評分對決。' },
  { id: 'beer-pong-vr', name: '虛擬啤酒乒乓球', description: '虛擬版啤酒乒乓球，精準投球擊倒對手杯子！', icon: Target, color: 'primary', players: '4-8 人', difficulty: 'medium', estimatedMinutes: 20, searchKeys: 'pijiu pingpang qiu beer pong vr', rulesSummary: '虛擬啤酒乒乓球對戰。' },
  { id: 'poker-face', name: '撲克臉', description: '考驗你的表情控制能力，找出說謊者！', icon: Smile, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'pukelian biaoqing kongzhi poker face', rulesSummary: '表情控制找出說謊者。' },
  { id: 'lip-sync-battle', name: '對嘴大賽', description: '展現你的對嘴功力，爭奪麥克風之王！', icon: Mic, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'duizui dasai lip sync battle', rulesSummary: '對嘴表演投票比賽。' },
  { id: 'voice-mod', name: '變聲器', description: '錄製你的聲音，讓變聲器來改造！', icon: Mic, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'bianshengqi voice mod', rulesSummary: '錄音變聲猜測遊戲。' },
  { id: 'gesture-guess', name: '手勢猜謎', description: '用你的手勢表達，讓大家來猜！', icon: Hand, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'shoushi caimi gesture guess', rulesSummary: '手勢表演猜測遊戲。' },
  { id: 'rhythm-master', name: '節奏大師', description: '測試你的節奏感，重現聽到的節奏！', icon: Music, color: 'accent', players: '2-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'jiezou dashi rhythm master', rulesSummary: '節奏記憶重現遊戲。' },
  { id: 'sound-sleuth', name: '聲音偵探', description: '考驗你的聽力，辨識各種聲音！', icon: Ear, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'shengyin zhentan sound sleuth', rulesSummary: '聲音辨識猜測遊戲。' },
  { id: 'pitch-perfect', name: '完美音準', description: '測試你的音感，聽音辨符！', icon: Music, color: 'accent', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 15, searchKeys: 'wanmei yunzhun pitch perfect', rulesSummary: '音感辨識遊戲。' },
  { id: 'vocal-war', name: '歌喉戰', description: '展現你的歌喉，爭奪歌王寶座！', icon: Mic, color: 'primary', players: '3-8 人', difficulty: 'medium', estimatedMinutes: 20, searchKeys: 'gehou zhan vocal war', rulesSummary: '歌唱比賽投票遊戲。' },
]

/** 遊戲 ID → 分類對照 */
export const GAME_CATEGORY_BY_ID: Record<string, GameCategory> = {
  'truth-or-dare': 'party', roulette: 'party', trivia: 'guess', dice: 'draw',
  'never-have-i-ever': 'party', 'kings-cup': 'party', 'baskin-robbins-31': 'guess',
  'up-down-stairs': 'guess', 'countdown-toast': 'reaction',
  'random-picker': 'draw', 'drink-or-safe': 'draw',
  'high-low': 'guess',
  titanic: 'other', 'finger-guessing': 'other',
  'name-train': 'party', 'liar-dice': 'draw',
  'coin-flip': 'draw',
  'who-is-undercover': 'facetoface', 'werewolf-lite': 'facetoface', 'heartbeat-challenge': 'facetoface',
  'mimic-face': 'facetoface', 'chemistry-test': 'facetoface', charades: 'facetoface',
  'would-you-rather': 'facetoface',
  'punishment-wheel': 'other',
  'who-most-likely': 'party',
  'secret-reveal': 'party',
  'thirteen-cards': 'other',
  blackjack: 'other',
  'hot-potato': 'reaction',
  'seven-tap': 'reaction',
  'spin-bottle': 'party',
  'dare-dice': 'draw',

  'toast-relay': 'party',
  'number-bomb': 'guess',
  '369-clap': 'reaction',
  'buzz-game': 'reaction',
  'category-chain': 'party',
  'two-truths-one-lie': 'facetoface',
  'spicy-truth-or-dare': 'adult',
  'spicy-never-have-i-ever': 'adult',
  'spicy-who-most-likely': 'adult',
  // Phase 2 新遊戲分類

  'between-cards': 'guess',
  'russian-roulette': 'party',
  'couple-test': 'facetoface',
  'soul-mate': 'facetoface',
  'spicy-would-you-rather': 'adult',
  'paranoia-game': 'party',
  'secret-confession': 'party',
  'dare-cards': 'party',
  'mind-reading': 'facetoface',
  'spicy-dice': 'adult',
  // Phase 3 新遊戲分類
  'reaction-master': 'reaction',
  'drunk-truth': 'party',
  'late-night': 'party',
  // Phase 4 新遊戲分類
  'drinking-word': 'party',
  'guess-song': 'party',
  'photo-guess': 'party',
  'word-chain': 'party',
  'team-guess': 'facetoface',
  'balance-game': 'guess',
  'fortune-draw': 'draw',
  'truth-wheel': 'party',

  'photo-bomb': 'party',
  // Phase 5 新遊戲分類
  'draw-guess': 'party',
  'taboo': 'party',
  'spot-diff': 'reaction',
  'quick-math': 'reaction',
  'color-blind': 'reaction',

  'finger-point': 'reaction',
  'shot-roulette': 'party',
  'music-chair': 'party',
  'bottle-cap': 'party',
  // Phase 6 新遊戲分類

  'emotion-read': 'reaction',
  'fast-type': 'reaction',
  'dice-war': 'facetoface',
  'price-guess': 'guess',
  'tongue-challenge': 'party',
  'imitate-me': 'party',

  'lucky-draw': 'draw',
  'time-freeze': 'reaction',
  'stare-contest': 'facetoface',
  'bluffing': 'party',
  // Phase 7 新遊戲分類
  'telephone': 'party',
  'finish-lyric': 'party',
  'tic-tac-shot': 'facetoface',
  'compliment-battle': 'party',
  'cocktail-mix': 'party',
  'reverse-say': 'reaction',
  'riddle-guess': 'party',
  'story-chain': 'party',
  // Phase 8 新遊戲分類
  'sound-imitate': 'party',
  'emoji-puzzle': 'party',
  'memory-match': 'party',
  'dance-battle': 'party',
  'beer-pong-vr': 'party',
  'poker-face': 'party',
  'lip-sync-battle': 'party',
  'voice-mod': 'party',
  'gesture-guess': 'party',
  'rhythm-master': 'party',
  'sound-sleuth': 'party',
  'pitch-perfect': 'party',
  'vocal-war': 'party',
}

/** 帶分類的遊戲列表（供 Lobby 使用） */
export type GameWithCategory = GameMeta & { category: GameCategory }

export const gamesWithCategory: GameWithCategory[] = GAMES_META.map((g) => ({
  ...g,
  category: GAME_CATEGORY_BY_ID[g.id] ?? 'other',
}))

/** 遊戲 ID 型別（由 GAMES_META 推導） */
export type GameId = (typeof GAMES_META)[number]['id'] | null

/** 依 id 取得單一遊戲 metadata */
export function getGameMeta(id: string): GameMeta | undefined {
  return GAMES_META.find((g) => g.id === id)
}

/** P0-009：訪客試玩 — 3–5 款非 18+ 熱門遊戲，試玩 3 次後強制登入 */
export const GUEST_TRIAL_GAME_IDS: string[] = ['dice', 'roulette', 'trivia', 'never-have-i-ever', 'liar-dice']

/** P0-002：18+ 辣味專區付費牆 — 所有 adult 分類遊戲需 premium 訂閱 */
export const PREMIUM_GAME_IDS: string[] = gamesWithCategory
  .filter((g) => g.category === 'adult')
  .map((g) => g.id)

/** G0.5：檢查遊戲是否需要付費訂閱 */
export function getGameRequiredTier(id: string): SubscriptionTier | undefined {
  if (PREMIUM_GAME_IDS.includes(id)) return 'premium'
  return undefined
}
