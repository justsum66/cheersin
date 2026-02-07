/**
 * P2.A1.3 常見錯誤觀念：進階課程專家經驗
 * 每門課可選配「常見錯誤」區塊，顯示易錯觀念
 */
export const COMMON_MISTAKES_BY_COURSE: Record<string, { title: string; items: string[] }> = {
  'wine-basics': {
    title: '常見錯誤觀念',
    items: [
      '以為「越貴越好喝」— 價格與個人口味無必然關係，多試才能找到自己喜歡的。',
      '把「單寧」當成苦味 — 單寧是澀感與結構，與苦味不同。',
      '以為白酒都要冰、紅酒都要室溫 — 依品種與風格調整，過冰或過溫都會壓抑風味。',
    ],
  },
  'whisky-101': {
    title: '常見錯誤觀念',
    items: [
      '以為「單一麥芽」一定比「調和」高級 — 兩者只是類型不同，各有頂級酒款。',
      '堅持加冰塊會破壞威士忌 — 加不加水/冰是個人喜好，適度稀釋有時更能打開香氣。',
      '把「年份」當成品質保證 — 年份高不一定更好，風味與平衡才是重點。',
    ],
  },
  _default: {
    title: '常見錯誤觀念',
    items: [
      '只憑價格或品牌選酒 — 多嘗試不同產區與品種，才能建立自己的味覺地圖。',
      '忽略保存與適飲溫度 — 光線、溫度與開瓶後時間都會影響風味。',
    ],
  },
}

export function getCommonMistakes(courseId: string): { title: string; items: string[] } | null {
  const data = COMMON_MISTAKES_BY_COURSE[courseId] ?? COMMON_MISTAKES_BY_COURSE._default
  return data.items.length > 0 ? data : null
}
