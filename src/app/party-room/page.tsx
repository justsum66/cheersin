import PartyRoomManager from '@/components/party/PartyRoomManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '派對直播室 | CheersIn',
  description: '即時同步的派對遊戲體驗，多人連線同樂',
}

export default function PartyRoomPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-rose-900/20 pointer-events-none" />
      <div className="container mx-auto relative z-10">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-center mb-4 gradient-text">
          Party Room Live
        </h1>
        <p className="text-center text-white/50 mb-12 max-w-lg mx-auto">
          多人連線，實時同步。讓每個人的手機都成為遊戲控制器。
        </p>
        <PartyRoomManager />
      </div>
    </div>
  )
}
