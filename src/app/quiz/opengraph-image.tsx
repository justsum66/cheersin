import { ImageResponse } from 'next/og'

/** 63 結果 OG 預覽：分享靈魂酒測連結時顯示的預覽圖 */
export const alt = '靈魂酒測 | Cheersin - 30 秒測出你的命定酒款'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function QuizOpenGraphImage() {
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
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a1a 50%, #1a1a3e 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: 48,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 16, textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
          靈魂酒測
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: 700 }}>
          30 秒測出你的命定酒款 · 結合星座與感官偏好
        </div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginTop: 32 }}>
          Cheersin · 發現你的靈魂之酒
        </div>
      </div>
    ),
    { ...size }
  )
}
