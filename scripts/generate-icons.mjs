/**
 * 從 public/logo_monochrome_gold.png 產生 favicon 與 PWA 圖示（可選，全站已改用 public/sizes/ 預生成圖）。
 * 需安裝 sharp：npm i -D sharp
 * 執行：node scripts/generate-icons.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicDir = path.join(root, 'public')
const logoPath = path.join(publicDir, 'logo_monochrome_gold.png')
const iconsDir = path.join(publicDir, 'icons')

const sizes = [
  { name: 'favicon-16x16.png', w: 16, h: 16 },
  { name: 'favicon-32x32.png', w: 32, h: 32 },
  { name: 'icon-192.png', w: 192, h: 192, dir: iconsDir },
  { name: 'icon-512.png', w: 512, h: 512, dir: iconsDir },
]

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.warn('Missing sharp. Run: npm i -D sharp')
    process.exit(1)
  }
  if (!fs.existsSync(logoPath)) {
    console.warn('Missing public/logo_monochrome_gold.png')
    process.exit(1)
  }
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }
  const buffer = fs.readFileSync(logoPath)
  for (const s of sizes) {
    const outDir = s.dir ?? publicDir
    const outPath = path.join(outDir, s.name)
    await sharp(buffer).resize(s.w, s.h).png().toFile(outPath)
    console.log('Generated', outPath)
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
