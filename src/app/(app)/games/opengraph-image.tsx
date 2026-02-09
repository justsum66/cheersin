import { ImageResponse } from 'next/og'

/** 199 派對遊樂場 OG 圖 */
export const alt = '派對遊樂場 | 沁飲 Cheersin 酒桌遊戲'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function GamesOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 12 }}>派對遊樂場</div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>
          沁飲 Cheersin · 命運轉盤 · 真心話大冒險 · 骰子 · 多人同樂
        </div>
      </div>
    ),
    { ...size }
  )
}
