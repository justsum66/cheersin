/** E48：定價頁用戶見證 — 可從此 config 或未來 API 更新；頭像用 dicebear 避免壞圖 */

export interface TestimonialItem {
  name: string
  text: string
  role: string
  avatar: string
}

export const TESTIMONIALS: TestimonialItem[] = [
  { name: 'Alex', text: '靈魂酒測超準，推薦的酒款都很對味。', role: '品酒愛好者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { name: 'Jamie', text: '派對遊戲讓聚會氣氛超嗨，朋友都問在哪裡玩。', role: '派對咖', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie' },
  { name: 'Sam', text: '個人方案 CP 值高，無限 AI 問到飽。', role: '訂閱用戶', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
]
