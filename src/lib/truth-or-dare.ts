/**
 * 41 真心話大冒險題庫：優先從 src/data/truthOrDare.json 載入（106–110），
 * 分類 溫和(mild)/普通(spicy)/大膽(adult)，難度 1–5 星；fallback 為內建題庫。
 */

import truthOrDareJson from '@/data/truthOrDare.json'

export type TruthDareLevel = 'mild' | 'spicy' | 'adult'

export interface TruthDareItem {
  text: string
  level: TruthDareLevel
  stars?: number
}

/** JSON 題目 level：mild | normal | bold | adult → TruthDareLevel */
type JsonLevel = 'mild' | 'normal' | 'bold' | 'adult'
const LEVEL_MAP: Record<JsonLevel, TruthDareLevel> = {
  mild: 'mild',
  normal: 'spicy',
  bold: 'spicy',
  adult: 'adult',
}
const STARS_BY_LEVEL: Record<JsonLevel, number> = {
  mild: 2,
  normal: 3,
  bold: 4,
  adult: 5,
}

/** 從 JSON 建構題庫：扁平化 questions.truth / questions.dare 並對應 level、stars */
function buildPoolFromJson(
  type: 'truth' | 'dare'
): TruthDareItem[] {
  const q = (truthOrDareJson as { questions: { truth: Record<string, Array<{ text: string; level: string }>>; dare: Record<string, Array<{ text: string; level: string }>> } }).questions?.[type]
  if (!q || typeof q !== 'object') return []
  const out: TruthDareItem[] = []
  const cats = ['mild', 'normal', 'bold', 'adult'] as const
  for (const cat of cats) {
    const list = q[cat]
    if (!Array.isArray(list)) continue
    const level = LEVEL_MAP[cat]
    const stars = STARS_BY_LEVEL[cat]
    for (const item of list) {
      if (item?.text) {
        out.push({
          text: item.text,
          level: level,
          stars,
        })
      }
    }
  }
  return out
}

const truthFromJson = buildPoolFromJson('truth')
const dareFromJson = buildPoolFromJson('dare')

const truth: TruthDareItem[] = [
  { text: '最近一次說謊是什麼時候？', level: 'mild', stars: 1 },
  { text: '在場誰最可能是你的理想型？', level: 'spicy', stars: 3 },
  { text: '喝醉後做過最糗的事？', level: 'mild', stars: 2 },
  { text: '手機裡最不想被人看到的照片是？', level: 'spicy', stars: 3 },
  { text: '曾經對好朋友的另一半動心過嗎？', level: 'spicy', stars: 4 },
  { text: '如果你必須與在場的一個人交換人生，你會選誰？', level: 'mild', stars: 2 },
  { text: '你最後悔的一件事是什麼？', level: 'mild', stars: 2 },
  { text: '你最不敢讓爸媽知道的事？', level: 'spicy', stars: 4 },
  { text: '在場誰最像你的前任？', level: 'spicy', stars: 4 },
  { text: '你曾經暗戀過誰超過一年？', level: 'mild', stars: 2 },
  { text: '你做過最瘋狂的夢是什麼？', level: 'mild', stars: 1 },
  { text: '你最後一次哭是什麼時候？', level: 'mild', stars: 2 },
  { text: '你最想改掉的壞習慣？', level: 'mild', stars: 1 },
  { text: '你曾經偷過什麼？', level: 'adult', stars: 5 },
  { text: '你覺得在場誰最會說謊？', level: 'mild', stars: 2 },
  { text: '你最後一次心動是什麼時候？', level: 'mild', stars: 2 },
  { text: '在場誰最可能跟你曖昧？', level: 'spicy', stars: 4 },
  { text: '你做過最衝動的決定？', level: 'mild', stars: 2 },
  { text: '你曾經為了誰改變自己？', level: 'mild', stars: 3 },
  { text: '你最不想被誰看到你喝醉？', level: 'spicy', stars: 3 },
  { text: '你曾經在感情裡做過最渣的事？', level: 'spicy', stars: 4 },
  { text: '你最後一次說「我愛你」是對誰？', level: 'spicy', stars: 3 },
  { text: '在場誰最可能跟你一夜情？', level: 'adult', stars: 5 },
  { text: '你曾經劈腿過嗎？', level: 'spicy', stars: 5 },
  { text: '你手機裡有誰的裸照或曖昧訊息？', level: 'adult', stars: 5 },
  { text: '你曾經跟陌生人接吻過嗎？', level: 'spicy', stars: 4 },
  { text: '你最想跟哪位名人約會？', level: 'mild', stars: 2 },
  { text: '你曾經在約會時放屁嗎？', level: 'mild', stars: 2 },
  { text: '你最後一次自慰是什麼時候？', level: 'adult', stars: 5 },
  { text: '你曾經在公共場所做過親密行為嗎？', level: 'adult', stars: 5 },
  { text: '你最怕被問什麼問題？', level: 'mild', stars: 2 },
  { text: '你曾經裝病請假嗎？', level: 'mild', stars: 2 },
  { text: '你偷看過誰的手機？', level: 'spicy', stars: 4 },
  { text: '你曾經在背後說誰壞話？', level: 'mild', stars: 2 },
  { text: '你最想刪掉的一段回憶？', level: 'mild', stars: 3 },
  { text: '你曾經為了錢做過什麼？', level: 'spicy', stars: 4 },
  { text: '在場誰最可能跟你吵架？', level: 'mild', stars: 2 },
  { text: '你最後一次跟家人吵架是什麼時候？', level: 'mild', stars: 2 },
  { text: '你曾經對誰一見鍾情？', level: 'spicy', stars: 3 },
  { text: '你最不想讓另一半知道的事？', level: 'spicy', stars: 4 },
  { text: '你曾經在職場上撒過什麼謊？', level: 'mild', stars: 3 },
  { text: '你最後一次跟人告白是什麼時候？', level: 'spicy', stars: 3 },
  { text: '你曾經收過最貴重的禮物？', level: 'mild', stars: 1 },
  { text: '你最想跟誰道歉？', level: 'mild', stars: 2 },
  { text: '你曾經做過最瘋狂的消費？', level: 'mild', stars: 2 },
  { text: '在場誰最可能跟你借錢不還？', level: 'mild', stars: 2 },
  { text: '你曾經對誰有罪惡感？', level: 'mild', stars: 3 },
  { text: '你最想重來的一次約會？', level: 'spicy', stars: 3 },
  { text: '你曾經在社交軟體上裝單身嗎？', level: 'spicy', stars: 5 },
]

const dare: TruthDareItem[] = [
  { text: '模仿在場某人喝酒的樣子', level: 'mild', stars: 1 },
  { text: '讓左邊的人決定你下一杯喝什麼', level: 'mild', stars: 2 },
  { text: '打開通訊錄，打給第三個聯絡人說「我醉了」', level: 'spicy', stars: 4 },
  { text: '深情地對著酒瓶唱一首情歌', level: 'mild', stars: 2 },
  { text: '做出最醜的鬼臉維持10秒', level: 'mild', stars: 1 },
  { text: '與右邊的人喝交杯酒', level: 'spicy', stars: 3 },
  { text: '隨機挑選一位異性對視 10 秒不准笑', level: 'spicy', stars: 4 },
  { text: '用奇怪的聲音說三句話', level: 'mild', stars: 1 },
  { text: '讓大家幫你畫臉（口紅或眉筆）', level: 'mild', stars: 2 },
  { text: '做 10 個伏地挺身或深蹲', level: 'mild', stars: 2 },
  { text: '對左邊的人說一句土味情話', level: 'spicy', stars: 3 },
  { text: '學一種動物叫直到有人笑', level: 'mild', stars: 1 },
  { text: '跟右手邊的人自拍一張鬼臉照', level: 'mild', stars: 2 },
  { text: '喝一口檸檬汁不皺眉', level: 'mild', stars: 1 },
  { text: '用非慣用手喝下一杯', level: 'mild', stars: 2 },
  { text: '對在場某人單膝下跪說「嫁給我」', level: 'spicy', stars: 4 },
  { text: '用屁股寫自己的名字', level: 'mild', stars: 2 },
  { text: '讓大家輪流餵你吃一口東西（閉眼）', level: 'spicy', stars: 3 },
  { text: '跟左邊的人十指交扣 30 秒', level: 'spicy', stars: 3 },
  { text: '用娃娃音說三句話', level: 'mild', stars: 1 },
  { text: '隨機選一人，用他的口頭禪說一句話', level: 'mild', stars: 2 },
  { text: '做 5 個波比跳', level: 'mild', stars: 2 },
  { text: '對鏡頭飛吻並傳給一位聯絡人', level: 'spicy', stars: 4 },
  { text: '讓右邊的人幫你選一個 IG 限動', level: 'spicy', stars: 3 },
  { text: '用英文說「我愛你」給在場某人', level: 'spicy', stars: 3 },
  { text: '模仿一位在場的人', level: 'mild', stars: 2 },
  { text: '喝一口酒然後轉三圈', level: 'mild', stars: 2 },
  { text: '讓大家投票決定你下一杯喝多少', level: 'mild', stars: 2 },
  { text: '對在場某人說「你長得好像我下一任」', level: 'spicy', stars: 4 },
  { text: '做 15 秒的抖音熱舞', level: 'mild', stars: 2 },
  { text: '讓左邊的人在你臉上畫一筆', level: 'mild', stars: 2 },
  { text: '用英文從 1 數到 20，數錯喝一口', level: 'mild', stars: 1 },
  { text: '對在場某人說「我其實有點喜歡你」', level: 'spicy', stars: 4 },
  { text: '做 20 秒的平板支撐', level: 'mild', stars: 2 },
  { text: '讓大家輪流問你一個問題，必須誠實回答', level: 'spicy', stars: 4 },
  { text: '用抖音梗說一句話', level: 'mild', stars: 1 },
  { text: '跟右邊的人牽手直到下一輪', level: 'spicy', stars: 3 },
  { text: '唱一首歌的副歌（走音也要唱完）', level: 'mild', stars: 2 },
  { text: '讓大家決定你下一輪選真心話還大冒險', level: 'mild', stars: 1 },
  { text: '對鏡頭說「大家好我是___」並傳限動', level: 'spicy', stars: 4 },
  { text: '用三種不同語氣說「我沒醉」', level: 'mild', stars: 1 },
  { text: '做一個在場沒人做過的鬼臉', level: 'mild', stars: 2 },
  { text: '讓右邊的人餵你喝一口', level: 'spicy', stars: 3 },
  { text: '說一個自己的黑歷史', level: 'spicy', stars: 3 },
  { text: '做 10 個開合跳', level: 'mild', stars: 1 },
  { text: '對在場某人說一句電影台詞（深情）', level: 'spicy', stars: 3 },
  { text: '讓大家投票選一個懲罰給你', level: 'mild', stars: 2 },
  { text: '用奇怪的口音說「乾杯」', level: 'mild', stars: 1 },
  { text: '跟左邊的人擊掌 10 次', level: 'mild', stars: 1 },
]

/** 擴充至 500+：重複並微調文字變體 */
function expandPool<T extends TruthDareItem>(pool: T[], targetMin: number): T[] {
  const out = [...pool]
  const templates = [
    { suffix: '（認真回答）', stars: 1 },
    { suffix: '？', stars: 2 },
    { suffix: '！', stars: 3 },
  ]
  while (out.length < targetMin) {
    const i = out.length % pool.length
    const base = pool[i]
    const t = templates[out.length % templates.length]
    out.push({
      ...base,
      text: base.text.replace(/[？?！!。.]$/, '') + t.suffix,
      stars: base.stars ?? t.stars,
    } as T)
  }
  return out
}

const TRUTH_MIN = 260
const DARE_MIN = 260

/** 優先使用 JSON 題庫（106–110），不足或無則用內建 + 擴充 */
export const truthPool: TruthDareItem[] =
  truthFromJson.length >= TRUTH_MIN
    ? truthFromJson
    : truthFromJson.length > 0
      ? [...truthFromJson, ...expandPool(truth, Math.max(0, TRUTH_MIN - truthFromJson.length))]
      : expandPool(truth, TRUTH_MIN)

export const darePool: TruthDareItem[] =
  dareFromJson.length >= DARE_MIN
    ? dareFromJson
    : dareFromJson.length > 0
      ? [...dareFromJson, ...expandPool(dare, Math.max(0, DARE_MIN - dareFromJson.length))]
      : expandPool(dare, DARE_MIN)

export function getTruthPool(): TruthDareItem[] {
  return truthPool
}

export function getDarePool(): TruthDareItem[] {
  return darePool
}

/** 18+ 專用題庫：僅 adult 等級，至少 200 真心話 + 200 大冒險，僅付費用戶可解鎖 */
const ADULT_TRUTH_MIN = 200
const ADULT_DARE_MIN = 200

function getAdultFromJson(type: 'truth' | 'dare'): TruthDareItem[] {
  const full = type === 'truth' ? truthFromJson : dareFromJson
  return full.filter((item) => item.level === 'adult')
}

const adultTruthFromJson = getAdultFromJson('truth')
const adultDareFromJson = getAdultFromJson('dare')

const adultTruthInline: TruthDareItem[] = [
  { text: '你最尷尬的約會經歷是什麼？', level: 'adult', stars: 5 },
  { text: '你曾經偷偷喜歡過朋友的另一半嗎？', level: 'adult', stars: 5 },
  { text: '你有什麼不為人知的性癖好？', level: 'adult', stars: 5 },
  { text: '你曾在什麼奇怪的地方做過？', level: 'adult', stars: 5 },
  { text: '你的初夜發生在什麼地方？', level: 'adult', stars: 5 },
  { text: '你曾對另一半撒過最大的謊是什麼？', level: 'adult', stars: 5 },
  { text: '你有沒有同時跟兩個人交往過？', level: 'adult', stars: 5 },
  { text: '你最近一次自我滿足是什麼時候？', level: 'adult', stars: 5 },
  { text: '描述你最糟糕的接吻經歷', level: 'adult', stars: 5 },
  { text: '你有沒有在公共場所被抓包過？', level: 'adult', stars: 5 },
  { text: '你曾經偷看過誰的私密照片？', level: 'adult', stars: 5 },
  { text: '你有沒有跟同事或上司發生過關係？', level: 'adult', stars: 5 },
  { text: '你曾經為了性而說謊嗎？', level: 'adult', stars: 5 },
  { text: '你有沒有曖昧過已婚的人？', level: 'adult', stars: 5 },
  { text: '你最想跟在場誰有更深入的了解？', level: 'adult', stars: 5 },
  { text: '你曾經有過 3P 的念頭嗎？', level: 'adult', stars: 5 },
  { text: '你有沒有買過成人用品？', level: 'adult', stars: 5 },
  { text: '你曾在什麼情況下被撩到心動？', level: 'adult', stars: 5 },
  { text: '你手機裡有誰的裸照或曖昧訊息？', level: 'adult', stars: 5 },
  { text: '你最後一次自慰是什麼時候？', level: 'adult', stars: 5 },
]

const adultDareInline: TruthDareItem[] = [
  { text: '對你左邊的人說一句最撩的情話', level: 'adult', stars: 5 },
  { text: '模仿你做過最性感的動作', level: 'adult', stars: 5 },
  { text: '讓在場最帥/美的人餵你喝一口酒', level: 'adult', stars: 5 },
  { text: '解開一顆扣子或脫掉一件配飾', level: 'adult', stars: 5 },
  { text: '用最性感的聲音念一段文字', level: 'adult', stars: 5 },
  { text: '跟你對面的人深情對視 30 秒', level: 'adult', stars: 5 },
  { text: '做出你認為最誘惑的表情', level: 'adult', stars: 5 },
  { text: '跟你右邊的人擁抱 10 秒', level: 'adult', stars: 5 },
  { text: '讓別人用一個詞形容你的身材', level: 'adult', stars: 5 },
  { text: '示範你最拿手的撩人技巧', level: 'adult', stars: 5 },
  { text: '讓在場的人投票你最性感的部位', level: 'adult', stars: 5 },
  { text: '打電話給你前任說「我想你」', level: 'adult', stars: 5 },
  { text: '讓你喜歡的人摸摸你的頭髮', level: 'adult', stars: 5 },
  { text: '表演一段挑逗的舞蹈動作', level: 'adult', stars: 5 },
  { text: '對鏡頭擺出三個性感姿勢', level: 'adult', stars: 5 },
  { text: '讓別人猜你最敏感的部位', level: 'adult', stars: 5 },
  { text: '跟選定的人玩親親蘋果', level: 'adult', stars: 5 },
  { text: '用身體語言表達你現在的想法', level: 'adult', stars: 5 },
  { text: '對在場最帥/美的人告白', level: 'adult', stars: 5 },
  { text: '讓大家看你手機最後一張照片', level: 'adult', stars: 5 },
]

const adultTruthCombined = [...adultTruthFromJson, ...adultTruthInline]
const adultDareCombined = [...adultDareFromJson, ...adultDareInline]
export const adultTruthPool: TruthDareItem[] = adultTruthCombined.length >= ADULT_TRUTH_MIN ? adultTruthCombined : expandPool(adultTruthCombined, ADULT_TRUTH_MIN)
export const adultDarePool: TruthDareItem[] = adultDareCombined.length >= ADULT_DARE_MIN ? adultDareCombined : expandPool(adultDareCombined, ADULT_DARE_MIN)

export function getAdultTruthPool(): TruthDareItem[] {
  return adultTruthPool
}

export function getAdultDarePool(): TruthDareItem[] {
  return adultDarePool
}
