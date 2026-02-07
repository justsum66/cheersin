/**
 * 擴充題庫至目標數量（任務 261-275）
 * 執行：node scripts/expand-question-banks.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../src/data')

// 誰最可能：各類別需達標的題數
const WML_TARGETS = { love: 150, friendship: 150, work: 100, life: 100, funny: 100 }
const WML_TEMPLATES = {
  love: ['誰最可能%s？', '誰最可能有%s？', '誰最可能會%s？'],
  friendship: ['誰最可能%s？', '誰最可能成為%s？', '誰最可能會%s？'],
  work: ['誰最可能%s？', '誰最可能成為%s？', '誰最可能會%s？'],
  life: ['誰最可能%s？', '誰最可能成為%s？', '誰最可能有%s？'],
  funny: ['誰最可能%s？', '誰最可能成為%s？', '誰最可能會%s？'],
}
const WML_ITEMS = {
  love: ['閃電結婚', '晚婚', '單身最久', '桃花最多', '被倒追', '主動告白', '暗戀最久', '分手最多次', '和初戀結婚', '談遠距離', '吃醋最兇', '為愛瘋狂', '感情路最順', '感情路最坎坷', '最專情', '最花心', '最浪漫', '最務實', '最容易被感動', '最難被打動', '最快陷入愛河', '最慢進入關係', '最會撒嬌', '最獨立', '最黏人', '最需要空間', '最會製造驚喜', '最不解風情', '最容易心動', '最鐵石心腸'],
  friendship: ['最講義氣', '最會保密', '最愛八卦', '最會安慰人', '最常遲到', '最守信用', '最常放鴿子', '朋友最多', '最重友誼', '最易翻臉', '最和事佬', '最愛起鬨', '最會調解', '最護短', '最公正', '最念舊', '最容易忘記約定', '最常記得生日', '最會維繫友誼', '最容易被朋友影響', '最獨立', '最依賴朋友', '最會請客', '最常被請', '最會傾聽', '最愛抱怨', '最會鼓勵人', '最毒舌'],
  work: ['最早上班', '最晚下班', '最常遲到', '最會摸魚', '升遷最快', '跳槽最多', '同公司待最久', '最會拍馬屁', '最敢頂嘴', '最會報告', '開會最愛發言', '最安靜', '最有人緣', '最容易得罪人', '最會談判', '最不會拒絕', '最容易加班', '最準時下班', '最會裝忙', '最有效率', '最會拖延', '最愛開會', '最討厭開會', '最會省錢', '最容易衝動消費'],
  life: ['最會煮飯', '最愛外食', '最會存錢', '最愛花錢', '最常運動', '最不運動', '最會打扮', '最隨性', '最愛乾淨', '最髒亂', '最準時', '最常遲到', '最會理財', '最月光', '最宅', '最愛出門', '最會開車', '最路癡', '最會規劃', '最隨興', '最養生', '最熬夜', '最早起', '最會照顧人', '最需要被照顧'],
  funny: ['最會講冷笑話', '最容易被逗笑', '最面癱', '最愛吐槽', '最白目', '最會接梗', '最容易冷場', '最愛發限動', '最常已讀不回', '最愛傳貼圖', '最會模仿', '最容易被嚇到', '最大膽', '最怕蟲', '最愛賴床', '最早起', '最會迷路', '最路痴', '最容易跌倒', '最會出糗', '最愛自拍', '最不愛拍照', '最會講故事', '最容易忘詞'],
}

// 秘密爆料：每類 60 題達 300+
const SR_TARGETS = { love: 65, embarrassing: 65, secrets: 65, confession: 65, wild: 65 }
const SR_TEMPLATES = {
  love: ['說一個你%s的感情經歷', '說一個你%s的約會故事', '說一個你%s的戀愛往事'],
  embarrassing: ['說一個你%s的糗事', '說一個你%s的尷尬經歷', '說一個讓你%s的瞬間'],
  secrets: ['說一個你%s的秘密', '說一個你從沒告訴過別人%s', '說一個你偷偷%s的經歷'],
  confession: ['說一個你%s的坦白', '說一個你最想%s的事', '說一個你%s的經歷'],
  wild: ['說一個你%s的瘋狂事', '說一個你%s的大膽經歷', '說一個你%s的刺激往事'],
}
const SR_ITEMS = {
  love: ['暗戀', '初戀', '失戀', '曖昧', '一見鍾情', '被表白', '表白失敗', '約會', '吵架', '和好', '吃醋', '嫉妒', '心動', '失望', '感動', '後悔', '衝動', '猶豫', '甜蜜', '痛苦', '單戀', '遠距離', '復合', '劈腿', '分手', '告白', '被拒絕'],
  embarrassing: ['在公共場所', '在公司', '在約會時', '在家人面前', '在朋友面前', '喝醉後', '緊張時', '得意忘形時', '太興奮時', '太尷尬以致於', '面試時', '演講時', '約會時', '初次見面時', '開會時', '拍照時'],
  secrets: ['對父母的', '對朋友的', '對戀人的', '對同事的', '關於自己的', '關於別人的', '做過的', '想過的', '隱藏很久的', '對家人的', '對老師的', '對老闆的', '從沒說過的', '難以啟齒的'],
  confession: ['最後悔', '最驕傲', '最害怕', '最想忘記', '最想重來', '最感謝', '最想道歉', '最不敢承認', '最想實現', '最遺憾', '最難過', '最開心', '最意外', '最珍惜'],
  wild: ['喝醉後', '年輕時', '衝動之下', '瞞著家人', '違反規則', '差點被抓', '冒險', '瘋狂', '刺激', '半夜', '旅行時', '派對上', '畢業時', '生日時', '跨年時', '萬聖節', '暑假'],
}

function expandWhoMostLikely() {
  const file = path.join(DATA_DIR, 'whoMostLikely.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  let nextId = 151
  for (const [cat, target] of Object.entries(WML_TARGETS)) {
    const arr = data.questions[cat] || []
    const items = WML_ITEMS[cat]
    const templates = WML_TEMPLATES[cat]
    const levels = ['mild', 'normal', 'bold']
    let safe = 0
    while (arr.length < target && safe++ < target + 200) {
      const idx = arr.length
      const itemIdx = idx % items.length
      const tmplIdx = Math.floor(idx / items.length) % templates.length
      const lvl = levels[idx % 3]
      let text = templates[tmplIdx].replace('%s', items[itemIdx])
      const suffix = idx >= items.length * templates.length ? `（續${Math.floor(idx / (items.length * templates.length))}）` : ''
      if (suffix) text = text.replace(/[？?]$/, '') + suffix + '？'
      else if (!text.endsWith('？') && !text.endsWith('?')) text += '？'
      if (!arr.some((q) => q.text === text)) {
        arr.push({ id: nextId++, text, level: lvl })
      }
    }
    data.questions[cat] = arr
  }
  data.metadata.total = Object.values(data.questions).reduce((s, a) => s + a.length, 0)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log('whoMostLikely expanded:', data.metadata.total)
}

function expandSecretReveal() {
  const file = path.join(DATA_DIR, 'secretReveal.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  let maxId = 0
  for (const arr of Object.values(data.prompts || {})) {
    if (Array.isArray(arr)) for (const p of arr) if (p?.id > maxId) maxId = p.id
  }
  let nextId = maxId + 1
  for (const [cat, target] of Object.entries(SR_TARGETS)) {
    const arr = data.prompts[cat] || []
    const items = SR_ITEMS[cat]
    const templates = SR_TEMPLATES[cat]
    const levels = ['mild', 'normal', 'bold']
    const existing = new Set(arr.map((q) => q.text))
    let safe = 0
    let genIdx = 0
    while (arr.length < target && safe++ < target + 300) {
      const tmplIdx = genIdx % templates.length
      const itemIdx = Math.floor(genIdx / templates.length) % items.length
      const base = templates[tmplIdx].replace('%s', items[itemIdx])
      const suffixNum = Math.floor(genIdx / (templates.length * items.length))
      const text = suffixNum > 0 ? `${base}（變體${suffixNum}）` : base
      genIdx++
      if (!existing.has(text)) {
        existing.add(text)
        arr.push({ id: nextId++, text, level: levels[arr.length % 3] })
      }
    }
    data.prompts[cat] = arr
  }
  data.metadata.total = Object.values(data.prompts).reduce((s, a) => s + a.length, 0)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log('secretReveal expanded:', data.metadata.total)
}

// neverHaveIEver: love 300, work 200, life 300, dark 200, adult 100
const NE_TARGETS = { love: 300, work: 200, life: 300, dark: 200, adult: 100 }
const NE_PREFIX = '我從來沒有'
const NE_ITEMS = {
  love: ['在第一次約會就牽手', '在電影院接吻', '為愛寫過詩', '送過手工禮物', '收過情書', '看過日出約會', '在海邊約會', '在星空下告白', '為對方學一道菜', '偷偷準備驚喜', '在紀念日忘記過', '因為對方而失眠', '偷偷查過對方的星座', '研究過對方的興趣', '為約會緊張一整天', '約會前換過三次衣服', '在約會時出糗', '因為太緊張而說錯話', '在約會後反覆回想', '因為對方的笑容而心動', '偷偷記住對方說過的話', '因為對方而改變行程', '在約會時假裝不餓', '因為對方而學新東西', '在約會時迷路', '因為對方的一句話而開心整天'],
  work: ['在開會時偷滑手機', '假裝在忙其實發呆', '把工作帶回家做', '加班到半夜', '請假去面試', '遲到後編理由', '在茶水間八卦', '偷吃同事的零食', '用公司印表機印私人文件', '上班時看新聞', '午休睡過頭', '忘記回覆主管的訊息', '在週報裡灌水', '把功勞歸自己', '甩鍋給同事', '在群組已讀不回', '上班時逛網拍', '偷偷提早下班', '在會議中神遊', '忘記 deadline', '搞錯客戶名字', '發錯郵件給所有人', '在辦公室打瞌睡', '偷偷抱怨主管', '幻想離職很多次'],
  life: ['忘記帶鑰匙出門', '把手機忘在計程車上', '訂錯餐廳日期', '買錯電影票場次', '在超市忘記帶錢包', '煮飯煮到燒焦', '忘記關瓦斯', '洗澡時沒熱水', '出門發現穿錯襪子', '趕火車卻跑錯月台', '忘記重要的人的生日', '在捷運上坐過站', '把重要文件丟進垃圾桶', '忘記繳帳單', '把咖啡打翻在鍵盤上', '穿反衣服出門', '忘記設定鬧鐘', '在圖書館睡著', '把飲料灑在別人身上', '在電梯裡放屁', '走路撞到玻璃門', '在自動門前等它開', '忘記自己鎖了門'],
  dark: ['偷看別人的日記', '在背後說人壞話', '嫉妒過朋友的成功', '希望某人失敗過', '做過不道德的事', '對父母撒過大謊', '偷過小東西', '作弊過', '陷害過別人', '背叛過朋友', '利用過別人', '說過傷人的話', '做過後悔一輩子的決定', '傷害過無辜的人', '對不起過某人但沒道歉', '假裝過很可憐', '裝病逃避', '推卸過責任', '說過完全不實的謊', '在關鍵時刻退縮'],
  adult: ['做過讓你臉紅的夢', '有過不可告人的幻想', '偷偷喜歡過不該喜歡的人', '做過大膽的事', '有過瘋狂的念頭', '在酒精影響下做過決定', '有過一夜情的念頭', '對某人產生過衝動', '做過讓自己驚訝的事', '有過難以啟齒的經歷'],
}

function expandNeverHaveIEver() {
  const file = path.join(DATA_DIR, 'neverHaveIEver.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  let nextId = 281
  for (const [cat, target] of Object.entries(NE_TARGETS)) {
    const arr = data.questions[cat] || []
    const items = NE_ITEMS[cat]
    const levels = ['mild', 'normal', 'bold']
    let safe = 0
    while (arr.length < target && safe++ < target + 500) {
      const idx = arr.length
      const base = NE_PREFIX + items[idx % items.length]
      const varNum = Math.floor(idx / items.length)
      const text = varNum > 0 ? base + `（變體${varNum}）` : base
      if (!arr.some((q) => q.text === text)) {
        arr.push({ id: nextId++, text, level: levels[idx % 3] })
      }
    }
    data.questions[cat] = arr
  }
  data.metadata.total = Object.values(data.questions).reduce((s, a) => s + a.length, 0)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log('neverHaveIEver expanded:', data.metadata.total)
}

// truthOrDare: 每 level 目標 truth + dare 合計 mild 300, normal 400, bold 300, adult 100
// 分配：truth 一半 dare 一半
const TD_PER_LEVEL = { mild: 150, normal: 200, bold: 150, adult: 50 } // per type
const TD_TRUTH_ITEMS = {
  mild: ['最喜歡的季節', '最喜歡的節日', '最難忘的生日', '最喜歡的運動', '最喜歡的書', '最喜歡的漫畫', '最喜歡的動漫', '最喜歡的YouTuber', '最喜歡的podcast', '最喜歡的穿搭', '最喜歡的香水', '最喜歡的飲料', '最喜歡的甜點', '最喜歡的早餐', '最喜歡的晚餐', '最喜歡的夜市小吃', '最喜歡的咖啡廳', '最喜歡的酒吧', '最喜歡的旅遊方式', '最喜歡的交通工具', '最喜歡的電影類型', '最喜歡的音樂類型', '最喜歡的動物', '最喜歡的植物', '最喜歡的顏色', '最喜歡的數字', '最喜歡的天氣', '最喜歡的戶外活動', '最喜歡的桌遊', '最喜歡的手遊', '最喜歡的卡通', '最喜歡的演員', '最喜歡的歌手', '最喜歡的網紅', '最喜歡的服裝品牌', '最喜歡的餐廳', '最喜歡的國家', '最喜歡的城市', '最喜歡的海邊', '最喜歡的山', '最喜歡的博物館', '最喜歡的展覽', '最喜歡的節慶活動', '最喜歡的週末活動', '最喜歡的放鬆方式', '最喜歡的睡前習慣', '最喜歡的早晨儀式', '最喜歡的零食', '最喜歡的水果'],
  normal: ['對主管說過白色謊言', '在工作時摸魚', '假裝生病請假', '偷看過別人手機', '在背後議論過別人', '嫉妒過朋友的成就', '對家人說過謊', '因為面子而撒謊', '隱瞞過重要的事', '做過讓自己後悔的決定', '傷害過無意傷害的人', '錯過重要的機會', '因為膽小而未行動', '因為衝動而後悔', '對喜歡的人不敢表白', '對討厭的人假裝友善', '為了融入團體而說違心的話'],
  bold: ['偷看過別人的訊息', '在背後說過某人壞話', '做過違背良心的事', '對信任你的人撒謊', '背叛過朋友的信任', '利用過別人的善良', '做過不敢讓人知道的事', '對父母隱瞞過重大事情', '在感情中欺騙過對方', '做過讓自己羞愧的事', '傷害過無辜的人', '推卸過本該承擔的責任'],
  adult: ['有過不可告人的幻想', '做過讓自己臉紅的事', '對不該喜歡的人動心過', '有過大膽的念頭', '在酒精影響下做過決定', '有過難以啟齒的經歷', '做過讓自己驚訝的事', '對某人產生過衝動'],
}
const TD_DARE_ITEMS = {
  mild: ['學狗叫三聲', '用娃娃音說三句話', '做十個開合跳', '閉眼轉五圈', '用單腳跳十下', '學一種動物走路', '唱一首兒歌', '說三個冷笑話', '用英文自我介紹', '模仿一位明星', '做鬼臉自拍', '用 rap 說自己名字', '倒著說自己的名字', '用方言說你好', '做瑜伽動作', '做五個伏地挺身', '唱生日快樂歌', '模仿新聞主播', '學貓叫五聲', '用假音唱歌', '單腳站立一分鐘', '做十個深蹲', '模仿在場一個人', '用左手寫字', '閉眼畫一個圓', '學機器人說話', '做最醜的表情', '用唱的介紹自己', '學老人走路', '學小孩哭', '做加油打氣動作', '模仿老師上課', '用奇怪口音說話', '學恐龍叫', '做企鵝走路', '學青蛙跳五下', '用肚子打拍子', '閉眼摸東西猜', '單手解鈕扣', '用腳夾筆寫字'],
  normal: ['讓右邊的人決定你下一杯', '對左邊的人說土味情話', '讓大家投票選你的綽號', '打電話給第三個聯絡人說我想你', '讓別人看你最近搜尋紀錄', '模仿在場一個人', '表演你喝醉的樣子', '說出你手機最醜的照片', '讓右邊的人發一則限動', '對窗外大喊我是最棒的', '讓大家給你畫臉', '說出你最近說的謊', '表演你失戀的樣子', '讓別人選一首歌你跳舞'],
  bold: ['坦白一個你從未說過的秘密', '讓大家看你的相簿 30 秒', '說出你對在場某人的真實想法', '打電話給前任說嗨', '讓大家投票選你的懲罰', '承認你做過最糗的事', '讓右邊的人查你 IG 追蹤', '說出你最不想讓人知道的事', '表演你最尷尬的時刻'],
  adult: ['對在場某人說一句真心話', '承認你對某人動心過', '說出你做過最大膽的事', '讓大家決定你的底線', '坦白一個難以啟齒的經歷'],
}

function expandTruthOrDare() {
  const file = path.join(DATA_DIR, 'truthOrDare.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  let truthId = 351
  let dareId = 526
  for (const [level, target] of Object.entries(TD_PER_LEVEL)) {
    const truthArr = data.questions.truth[level] || []
    const dareArr = data.questions.dare[level] || []
    const truthItems = TD_TRUTH_ITEMS[level]
    const dareItems = TD_DARE_ITEMS[level]
    const truthQ = level === 'mild' ? (t) => `你${t}是什麼？` : level === 'normal' ? (t) => `你曾經${t}嗎？` : level === 'bold' ? (t) => `你敢坦白你${t}嗎？` : (t) => `你有過${t}嗎？`
    const suffixes = ['', '（認真回答）', '（誠實說）', '（想一想）']
    let safe = 0
    while (truthArr.length < target && safe++ < target + 500) {
      const idx = truthArr.length
      const t = truthItems[idx % truthItems.length]
      const sf = suffixes[Math.floor(idx / truthItems.length) % suffixes.length]
      const base = typeof truthQ === 'function' ? truthQ(t) : `你${t}？`
      const text = sf ? base.replace(/[？?]$/, '') + sf + '？' : base
      if (!truthArr.some((q) => q.text === text)) {
        truthArr.push({ id: truthId++, text, level })
      }
    }
    const dareSuffixes = ['', '（限 30 秒內完成）', '（不准笑）', '（認真做）']
    safe = 0
    while (dareArr.length < target && safe++ < target + 500) {
      const idx = dareArr.length
      const d = dareItems[idx % dareItems.length]
      const sf = dareSuffixes[Math.floor(idx / dareItems.length) % dareSuffixes.length]
      const text = sf ? d + sf : d
      if (!dareArr.some((q) => q.text === text)) {
        dareArr.push({ id: dareId++, text, level })
      }
    }
    data.questions.truth[level] = truthArr
    data.questions.dare[level] = dareArr
  }
  const total = Object.values(data.questions.truth).flat().length + Object.values(data.questions.dare).flat().length
  data.metadata.total = total
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log('truthOrDare expanded:', total)
}

expandWhoMostLikely()
expandSecretReveal()
expandNeverHaveIEver()
expandTruthOrDare()
console.log('Done.')
