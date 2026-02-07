/**
 * P2.A4.1 延伸閱讀書單：各課程推薦書單與連結
 */
export interface ReadingItem {
  title: string
  url: string
  note?: string
}

export const LEARN_READING_BY_COURSE: Record<string, ReadingItem[]> = {
  'wine-basics': [
    { title: 'Wine Folly: The Essential Guide to Wine', url: 'https://winefolly.com', note: '入門圖文並茂' },
    { title: 'The World Atlas of Wine', url: 'https://www.octopusbooks.co.uk', note: '產區地圖經典' },
  ],
  'whisky-101': [
    { title: 'The World Atlas of Whisky', url: 'https://www.octopusbooks.co.uk', note: '威士忌產區與酒廠' },
  ],
  'wset-l2-wines': [
    { title: 'WSET Level 2 Study Guide', url: 'https://www.wsetglobal.com', note: '官方教材' },
  ],
  'cocktail-basics': [
    { title: 'The Joy of Mixology', url: 'https://www.penguinrandomhouse.com', note: '經典調酒書' },
  ],
  _default: [
    { title: '葡萄酒與烈酒教育信託 (WSET)', url: 'https://www.wsetglobal.com', note: '國際認證' },
    { title: 'Court of Master Sommeliers', url: 'https://www.mastersommeliers.org', note: '侍酒師認證' },
  ],
}

export function getReadingListForCourse(courseId: string): ReadingItem[] {
  return LEARN_READING_BY_COURSE[courseId] ?? LEARN_READING_BY_COURSE._default ?? []
}
