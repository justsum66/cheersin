/**
 * R2-178：酒類配對記憶 — 酒款名 ⇄ 產區/風味，翻牌配對用
 */

export interface WinePairItem {
  /** 酒款名稱 */
  wine: string
  /** 產區或風味描述 */
  regionOrFlavor: string
}

/** 酒款與產區/風味配對（6 對 = 12 張牌） */
export const WINE_PAIRS: WinePairItem[] = [
  { wine: '夏多內', regionOrFlavor: '勃艮第／加州，柑橘、奶油' },
  { wine: '黑皮諾', regionOrFlavor: '勃艮第、紐西蘭，紅櫻桃、土壤' },
  { wine: '卡本內蘇維翁', regionOrFlavor: '波爾多、納帕，黑醋栗、單寧' },
  { wine: '梅洛', regionOrFlavor: '波爾多、智利，李子和黑櫻桃' },
  { wine: '麗絲玲', regionOrFlavor: '德國、阿爾薩斯，花香、果酸' },
  { wine: '清酒', regionOrFlavor: '日本，米麴、旨味' },
]
