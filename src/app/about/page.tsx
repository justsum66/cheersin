/**
 * P3-464：品牌故事頁 — 關於我們、使命與團隊
 */
import Link from 'next/link'

export const metadata = {
  title: '關於我們 | 派對救星 - 讓聚會更有趣',
  description: 'Cheersin 的使命：消滅冷場，讓每次聚會都嗨翻天。AI 派對救星提供破冰遊戲、選酒建議與活動流程。',
}

export default function AboutPage() {
  return (
    <main className="page-container-mobile min-h-screen bg-background py-8">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-foreground">你的派對救星</h1>
        <p className="mb-4 text-foreground/90">
          Cheersin 致力於解決每一個「派對冷場」瞬間。我們是你的口袋軍師，隨時提供破冰遊戲、選酒建議與活動流程。不再需要擔心朋友無聊，或者不知道該喝什麼。
        </p>
        <p className="mb-4 text-foreground/90">
          無論是居家小酌、大型派對，還是 KTV 狂歡，Cheersin 都能幫你把氣氛炒到最高點。
        </p>
        <p className="mb-8 text-foreground/80 text-sm">
          特色功能：30 秒派對急救包、酒局劇本殺、AI 派對 DJ、千款調酒酒譜。
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          回首頁
        </Link>
      </div>
    </main>
  )
}
