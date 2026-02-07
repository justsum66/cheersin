import type { Metadata } from 'next'
import GamesPageDynamic from '@/components/games/GamesPageDynamic'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** GAMES_500 #3 #16 #17 #18：房間邀請 OG — title/description 字數上限；無 room 不輸出房間 OG */
/** GAMES_500 #4 #146 #168 #173：動態 OG image／邀請分享圖含房間名與品牌／短網址／社群預覽 — 需 API 或 generateImage 後端支援後於此或 opengraph-image 實作 */
const ROOM_TITLE_MAX = 30
const OG_DESCRIPTION_MAX = 160

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const room = params?.room?.trim()
  if (!room) return {}
  const roomShort = room.length > ROOM_TITLE_MAX ? room.slice(0, ROOM_TITLE_MAX) + '…' : room
  const desc = `派對遊樂場邀請 — 加入房間 ${roomShort} 一起玩。真心話大冒險、國王杯、轉盤等酒桌遊戲。`
  const ogDesc = desc.length > OG_DESCRIPTION_MAX ? desc.slice(0, OG_DESCRIPTION_MAX - 1) + '…' : desc
  return {
    title: `派對邀請 · ${roomShort} | Cheersin`,
    description: ogDesc,
    openGraph: {
      title: `派對邀請 · ${roomShort} | Cheersin`,
      description: ogDesc,
      url: `${BASE}/games?room=${encodeURIComponent(room)}`,
    },
  }
}

export default function GamesPageRoute() {
  return <GamesPageDynamic />
}
