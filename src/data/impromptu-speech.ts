/**
 * R2-170：即興演講 — 隨機抽題（主題/情境）
 */

export const IMPROMPTU_TOPICS: string[] = [
  '如果明天不用上班，你會做什麼？',
  '用三句話介紹你左手邊的人',
  '你喝過最難忘的一杯酒是什麼？',
  '如果只能選一種酒喝一輩子，你選什麼？',
  '說一個你小時候的糗事',
  '你覺得在場誰最會喝？為什麼？',
  '用一個詞形容今晚的氣氛',
  '如果有一台時光機，你想去哪裡？',
  '說一個你最近學到的新東西',
  '你心目中的完美週末',
  '如果你可以擁有一種超能力，你要什麼？',
  '說一個大家不知道的你的小習慣',
  '你覺得「微醺」是什麼感覺？',
  '敬酒時你會說什麼？',
  '用一句話總結你的 2024',
]

export function pickRandomImpromptuTopic(): string {
  return IMPROMPTU_TOPICS[Math.floor(Math.random() * IMPROMPTU_TOPICS.length)]
}
