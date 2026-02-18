#!/usr/bin/env node
/**
 * A2. 圖片優化檢查腳本
 * 分析專案中所有圖片，提供WebP/AVIF轉換建議
 */

import { promises as fs } from 'fs'
import { join, extname, basename } from 'path'

// 支援的圖片格式
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
const MODERN_FORMATS = ['.webp', '.avif']

interface ImageInfo {
  path: string
  name: string
  extension: string
  size: number
  isModernFormat: boolean
}

interface OptimizationReport {
  totalImages: number
  modernFormatCount: number
  legacyFormatCount: number
  totalSize: number
  potentialSavings: number
  conversionCandidates: ImageInfo[]
}

/**
 * 遞迴搜尋目錄中的圖片
 */
async function findImages(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const files = await fs.readdir(dir)
    
    for (const file of files) {
      const filePath = join(dir, file)
      const stat = await fs.stat(filePath)
      
      if (stat.isDirectory()) {
        // 跳過node_modules和.git等目錄
        if (!['node_modules', '.git', '.next', 'coverage'].includes(file)) {
          await findImages(filePath, fileList)
        }
      } else {
        const ext = extname(file).toLowerCase()
        if (IMAGE_EXTENSIONS.includes(ext) || MODERN_FORMATS.includes(ext as any)) {
          fileList.push(filePath)
        }
      }
    }
  } catch (error) {
    console.warn(`無法讀取目錄: ${dir}`, error)
  }
  
  return fileList
}

/**
 * 獲取圖片資訊
 */
async function getImageInfo(filePath: string): Promise<ImageInfo> {
  const stat = await fs.stat(filePath)
  const ext = extname(filePath).toLowerCase()
  
  return {
    path: filePath,
    name: basename(filePath),
    extension: ext,
    size: stat.size,
    isModernFormat: MODERN_FORMATS.includes(ext as any)
  }
}

/**
 * 生成最佳化報告
 */
async function generateReport(): Promise<OptimizationReport> {
  const projectRoot = process.cwd()
  const imagePaths = await findImages(projectRoot)
  
  const imageInfos = await Promise.all(
    imagePaths.map(path => getImageInfo(path))
  )
  
  const modernImages = imageInfos.filter(img => img.isModernFormat)
  const legacyImages = imageInfos.filter(img => !img.isModernFormat)
  
  // 計算潛在節省（假設WebP壓縮率60%，AVIF壓縮率40%）
  const potentialSavings = legacyImages.reduce((total, img) => {
    const compressionRatio = img.size > 100000 ? 0.4 : 0.6 // 大圖用AVIF
    return total + (img.size * compressionRatio)
  }, 0)
  
  const totalSize = imageInfos.reduce((sum, img) => sum + img.size, 0)
  
  return {
    totalImages: imageInfos.length,
    modernFormatCount: modernImages.length,
    legacyFormatCount: legacyImages.length,
    totalSize,
    potentialSavings: Math.round(potentialSavings),
    conversionCandidates: legacyImages
      .filter(img => img.size > 50000) // 只列出大於50KB的圖片
      .sort((a, b) => b.size - a.size) // 按大小排序
      .slice(0, 20) // 只顯示前20個
  }
}

/**
 * 顯示報告
 */
function displayReport(report: OptimizationReport) {
  console.log('\n🖼️  Cheersin 圖片優化分析報告')
  console.log('=====================================\n')
  
  console.log(`📊 總覽:`)
  console.log(`  • 總圖片數: ${report.totalImages}`)
  console.log(`  • 現代格式: ${report.modernFormatCount} (${(report.modernFormatCount / report.totalImages * 100).toFixed(1)}%)`)
  console.log(`  • 傳統格式: ${report.legacyFormatCount} (${(report.legacyFormatCount / report.totalImages * 100).toFixed(1)}%)`)
  console.log(`  • 總體積: ${(report.totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  • 潛在節省: ${(report.potentialSavings / 1024 / 1024).toFixed(2)} MB (${(report.potentialSavings / report.totalSize * 100).toFixed(1)}%)\n`)
  
  if (report.conversionCandidates.length > 0) {
    console.log(`🎯 建議優先轉換的圖片 (${report.conversionCandidates.length} 個):`)
    console.log('----------------------------------------')
    
    report.conversionCandidates.forEach((img, index) => {
      const sizeMB = (img.size / 1024 / 1024).toFixed(2)
      const relativePath = img.path.replace(process.cwd(), '.')
      console.log(`${String(index + 1).padStart(2)}. ${relativePath}`)
      console.log(`    大小: ${sizeMB} MB | 格式: ${img.extension.toUpperCase()}\n`)
    })
  }
  
  console.log('✅ 優化建議:')
  console.log('  1. 使用 Squoosh 或 ImageMagick 批量轉換為 WebP')
  console.log('  2. 重要圖片提供 AVIF 版本（現代瀏覽器）')
  console.log('  3. 保留原始格式作為 fallback')
  console.log('  4. 使用我們的 OptimizedImage 元件統一管理\n')
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log('🔍 正在分析專案圖片...\n')
    
    const report = await generateReport()
    displayReport(report)
    
    // 如果有需要轉換的圖片，輸出JSON報告
    if (report.conversionCandidates.length > 0) {
      const outputPath = join(process.cwd(), 'image-optimization-report.json')
      await fs.writeFile(
        outputPath, 
        JSON.stringify(report.conversionCandidates, null, 2)
      )
      console.log(`📋 詳細報告已輸出至: ${outputPath}\n`)
    }
    
  } catch (error) {
    console.error('❌ 分析失敗:', error)
    process.exit(1)
  }
}

// 執行
if (require.main === module) {
  main()
}

export { generateReport, displayReport }