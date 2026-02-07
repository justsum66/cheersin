import { ImageResponse } from 'next/og'

/** T009 P2：OG 圖與分享預覽 — 1200×630，品牌 + 一句標語、無過多文字，直播/社群分享好看 */
export const alt = 'Cheersin | 探索你的靈魂之酒'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
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
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 40%, #0a0a0f 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>Cheersin</div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.85)' }}>探索你的靈魂之酒</div>
      </div>
    ),
    { ...size }
  )
}
