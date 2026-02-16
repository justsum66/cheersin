/** E48：定價頁用戶見證 — 可從此 config 或未來 API 更新；頭像用 dicebear 避免壞圖 */

export interface TestimonialItem {
  name: string
  text: string
  role: string
  avatar: string
}

export const TESTIMONIALS: TestimonialItem[] = [
  { name: 'Jamie', text: '這簡直是派對救星！原本大家都在滑手機，用了破冰遊戲後氣氛瞬間嗨爆。', role: '生日派對主揪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie' },
  { name: 'Chris', text: '以前要帶一堆桌遊出門，現在只要一支手機。遊戲種類超多，朋友都玩瘋了。', role: '桌遊愛好者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' },
  { name: 'Sarah', text: '我不懂酒，但 AI 侍酒師讓我秒變專家，推薦的酒款大家都說讚。', role: '新手主揪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { name: 'Alex', text: '一個月才一杯調酒的錢，換來無限歡樂，CP 值太高了！', role: '資深派對咖', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
]
