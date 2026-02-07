/**
 * RSC：FAQ 區塊，靜態資料由 server 提供，互動由 HomeFAQAccordion client 處理
 */
import HomeFAQAccordion from './HomeFAQAccordion'

const FAQ_ITEMS = [
  { q: '測驗要付費嗎？', a: '靈魂酒測與多數功能永久免費，進階課程與 AI 深度分析可選購 Pro。' },
  { q: '多久能拿到結果？', a: '約 30 秒完成測驗，結果與推薦酒款立即顯示。' },
  { q: '派對遊戲需要幾人？', a: '多數遊戲 2 人即可，建議 4–8 人體驗最佳。' },
  { q: 'AI 侍酒師有使用次數嗎？', a: '免費方案每日有額度，Pro 會員享有更高額度與優先回應。' },
]

export default async function HomeFAQServer() {
  return <HomeFAQAccordion items={FAQ_ITEMS} />
}
