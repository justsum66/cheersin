import { readFileSync } from 'fs'
import { join } from 'path'

/** T009 P2：OG 圖與分享預覽 — 使用預生成 1200×630 品牌圖 */
export const alt = 'Cheersin 沁飲 | 探索你的靈魂之酒'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  const filePath = join(process.cwd(), 'public', 'sizes', 'og_image_1200x630.png')
  const buffer = readFileSync(filePath)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
