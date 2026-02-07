/**
 * P2.A4.2 論文引用資料：專家級課程參考文獻
 */
export interface ReferenceItem {
  title: string
  url?: string
  authors?: string
  year?: string
  note?: string
}

export const LEARN_REFERENCES_BY_COURSE: Record<string, ReferenceItem[]> = {
  'wine-basics': [
    { title: 'Wine Folly: The Essential Guide to Wine', authors: 'Madeline Puckette', year: '2015', note: '入門圖文' },
    { title: 'The World Atlas of Wine', authors: 'Hugh Johnson, Jancis Robinson', year: '2019', note: '產區權威' },
  ],
  'whisky-101': [
    { title: 'The World Atlas of Whisky', authors: 'Dave Broom', year: '2014', note: '產區與酒廠' },
  ],
  'wset-l2-wines': [
    { title: 'WSET Level 2 Award in Wines Specification', url: 'https://www.wsetglobal.com', year: '2023', note: '官方大綱' },
  ],
  _default: [
    { title: 'WSET Global', url: 'https://www.wsetglobal.com', note: '認證與教材' },
  ],
}

export function getReferencesForCourse(courseId: string): ReferenceItem[] {
  return LEARN_REFERENCES_BY_COURSE[courseId] ?? LEARN_REFERENCES_BY_COURSE._default ?? []
}
