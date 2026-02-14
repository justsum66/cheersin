/**
 * R2-172：配對遊戲題庫 — 兩人一組回答問題，答案一致得分、不一致喝酒
 */

export interface MatchAnswerQuestion {
  q: string
  options: string[]
}

export const MATCH_ANSWER_QUESTIONS: MatchAnswerQuestion[] = [
  { q: '這杯敬誰？', options: ['壽星', '主辦', '大家', '對面'] },
  { q: '下一攤想去哪？', options: ['續攤', '回家', '夜唱', '宵夜'] },
  { q: '最常喝的酒類？', options: ['啤酒', '紅白酒', '調酒', '烈酒'] },
  { q: '酒量自認？', options: ['一杯倒', '普普', '還行', '海量'] },
  { q: '喝醉後會？', options: ['睡覺', '話多', '哭', '笑'] },
  { q: '下酒菜最愛？', options: ['滷味', '燒烤', '薯條', '毛豆'] },
  { q: '乾杯時會說？', options: ['乾！', 'Cheers', '隨意', '敬你'] },
  { q: '今晚誰買單？', options: ['AA', '輪流', '壽星', '我請'] },
  { q: '最怕的懲罰？', options: ['喝雙倍', '大冒險', '真心話', '唱歌'] },
  { q: '選一個數字？', options: ['1', '3', '7', '9'] },
]
