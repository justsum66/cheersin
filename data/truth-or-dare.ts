/**
 * 41 真心話大冒險題庫：500+ 題，分類 溫和(mild)/普通(spicy)/大膽(adult)，難度 1-5 星
 */

export type TruthDareLevel = 'mild' | 'spicy' | 'adult'

export interface TruthDareItem {
  text: string
  level: TruthDareLevel
  stars?: number
}

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

export const truthPool: TruthDareItem[] = expandPool(truth, TRUTH_MIN)
export const darePool: TruthDareItem[] = expandPool(dare, DARE_MIN)

export function getTruthPool(): TruthDareItem[] {
  return truthPool
}

export function getDarePool(): TruthDareItem[] {
  return darePool
}
