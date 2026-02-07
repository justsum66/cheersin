'use client'

/**
 * P2 進階功能籌備中：彙整品飲筆記模板、每日推播、盲品/限時/對戰/模擬考、筆記分享、評論、短影片、ASMR 等
 */
import Link from 'next/link'
import { ChevronLeft, FileText, Bell, Wine, Clock, Users, FileCheck, Share2, MessageCircle, Video, Music, Map, Sparkles, Film } from 'lucide-react'

const ITEMS: { id: string; title: string; desc: string; icon: typeof FileText }[] = [
  { id: 'P2.A2.1', title: '品飲筆記模板 PDF', desc: '可下載 PDF、可列印版', icon: FileText },
  { id: 'P2.C3.3', title: '每日一題推播', desc: '實作每日推播通知', icon: Bell },
  { id: 'P2.C1.2', title: '盲品模擬測驗', desc: 'CMS 格式測驗', icon: Wine },
  { id: 'P2.C1.3', title: '限時挑戰模式', desc: '模擬考試壓力', icon: Clock },
  { id: 'P2.C3.1', title: '對戰測驗模式', desc: '好友 PK', icon: Users },
  { id: 'P2.C3.4', title: '模擬考', desc: '完整認證考試格式', icon: FileCheck },
  { id: 'P2.E2.1', title: '筆記公開分享', desc: '社群討論功能', icon: Share2 },
  { id: 'P2.E2.2', title: '評論點讚置頂', desc: '課程評論區互動', icon: MessageCircle },
  { id: 'P2.F1.1', title: '60 秒短影片', desc: '關鍵概念 TikTok 風格', icon: Video },
  { id: 'P2.F1.2', title: 'ASMR 品酒音效', desc: '品飲課程沉浸體驗', icon: Music },
  { id: 'P2.F1.3', title: '空拍環景素材', desc: '產區介紹視覺震撼', icon: Map },
  { id: 'P2.F2.3', title: '香氣模擬', desc: '葡萄品種互動元素', icon: Sparkles },
  { id: 'P2.F3.2', title: '專家訪談影音', desc: '影音片段嵌入', icon: Film },
]

export default function LearnComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">進階功能籌備中</h1>
        <p className="text-white/60 text-sm mb-8">
          以下功能已規劃，上線時將於各入口開放。
        </p>

        <div className="space-y-3">
          {ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="p-2 rounded-lg bg-primary-500/20">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white/90">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
                <span className="ml-auto text-white/40 text-xs">籌備中</span>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-white/40 text-sm">
          <Link href="/learn" className="text-primary-400 hover:underline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            返回課程總覽
          </Link>
        </p>
      </div>
    </div>
  )
}
