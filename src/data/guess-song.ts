/**
 * R2-139：猜歌名 — 題庫（歌名＋歌詞片段），無版權音源時以文字猜題
 */

export interface GuessSongItem {
  title: string
  artist: string
  hint: string
  era: string
}

export const GUESS_SONG_ITEMS: GuessSongItem[] = [
  { title: '小幸運', artist: '田馥甄', hint: '我聽見雨滴落在青青草地', era: '2010s' },
  { title: '告白氣球', artist: '周杰倫', hint: '塞納河畔左岸的咖啡', era: '2010s' },
  { title: '愛情轉移', artist: '陳奕迅', hint: '徘徊過多少櫥窗', era: '2000s' },
  { title: '稀客', artist: '張惠妹', hint: '我是你的稀客', era: '2020s' },
  { title: '後來', artist: '劉若英', hint: '後來我總算學會了如何去愛', era: '2000s' },
  { title: '青花瓷', artist: '周杰倫', hint: '素胚勾勒出青花筆鋒濃轉淡', era: '2000s' },
  { title: '演員', artist: '薛之謙', hint: '簡單點 說話的方式簡單點', era: '2010s' },
  { title: '說好的幸福呢', artist: '周杰倫', hint: '妳的回話凌亂著', era: '2000s' },
  { title: '我懷念的', artist: '孫燕姿', hint: '我問為什麼', era: '2000s' },
  { title: '光年之外', artist: '鄧紫棋', hint: '緣份讓我們相遇亂世以外', era: '2010s' },
  { title: '漂向北方', artist: '黃明志', hint: '有人為了生活背井離鄉', era: '2010s' },
  { title: '大魚', artist: '周深', hint: '海浪無聲將夜幕深深淹沒', era: '2010s' },
  { title: '起風了', artist: '吳青峰', hint: '這一路上走走停停', era: '2010s' },
  { title: '體面', artist: '于文文', hint: '分手應該體面', era: '2010s' },
  { title: '夜曲', artist: '周杰倫', hint: '一群嗜血的螞蟻', era: '2000s' },
  { title: '稻香', artist: '周杰倫', hint: '對這個世界如果你有太多的抱怨', era: '2000s' },
  { title: '成全', artist: '林宥嘉', hint: '我對你付出的青春這麼多年', era: '2010s' },
  { title: '修煉愛情', artist: '林俊傑', hint: '憑什麼要失望', era: '2010s' },
  { title: '泡沫', artist: '鄧紫棋', hint: '陽光下的泡沫 是彩色的', era: '2010s' },
  { title: '小情歌', artist: '蘇打綠', hint: '這是一首簡單的小情歌', era: '2000s' },
  { title: '那些年', artist: '胡夏', hint: '又回到最初的起點', era: '2010s' },
  { title: '突然好想你', artist: '五月天', hint: '最怕空氣突然安靜', era: '2000s' },
  { title: '溫柔', artist: '五月天', hint: '走在風中 今天陽光 突然好溫柔', era: '2000s' },
  { title: '倔強', artist: '五月天', hint: '當我和世界不一樣', era: '2000s' },
]
