#!/usr/bin/env node
/**
 * A3. Critical CSS 提取與內聯腳本
 * 分析構建輸出的CSS，提取首屏關鍵樣式並生成內聯版本
 */

import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractCriticalCSS, generateInlineStyleTag } from '../src/lib/critical-css'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface CSSAnalysisResult {
  originalSize: number
  criticalSize: number
  reduction: number
  criticalCSS: string
  inlineTag: string
}

/**
 * 找到Next.js構建輸出的CSS檔案
 */
async function findBuildCSS(): Promise<string[]> {
  const buildDir = join(process.cwd(), '.next/static/css')
  
  try {
    const files = await fs.readdir(buildDir)
    return files
      .filter(file => file.endsWith('.css'))
      .map(file => join(buildDir, file))
  } catch (error) {
    console.warn('找不到構建CSS檔案，使用開發模式分析')
    return []
  }
}

/**
 * 分析並提取關鍵CSS
 */
async function analyzeAndExtract(): Promise<CSSAnalysisResult | null> {
  const cssFiles = await findBuildCSS()
  
  if (cssFiles.length === 0) {
    console.log('⚠️  未找到構建CSS檔案，請先執行 npm run build')
    return null
  }
  
  console.log('🔍 正在分析CSS檔案...')
  console.log(`找到 ${cssFiles.length} 個CSS檔案\n`)
  
  // 讀取所有CSS內容
  let combinedCSS = ''
  let totalSize = 0
  
  for (const file of cssFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8')
      const size = Buffer.byteLength(content, 'utf-8')
      combinedCSS += content + '\n'
      totalSize += size
      console.log(`  • ${file.split('/').pop()}: ${(size / 1024).toFixed(2)} KB`)
    } catch (error) {
      console.warn(`  ⚠️  無法讀取: ${file}`)
    }
  }
  
  console.log(`\n📊 總計: ${(totalSize / 1024).toFixed(2)} KB\n`)
  
  // 提取關鍵CSS
  console.log('🎯 正在提取關鍵CSS...')
  const criticalCSS = extractCriticalCSS(combinedCSS)
  const criticalSize = Buffer.byteLength(criticalCSS, 'utf-8')
  const reduction = Math.round((1 - criticalSize / totalSize) * 100)
  
  console.log(`  • 關鍵CSS大小: ${(criticalSize / 1024).toFixed(2)} KB`)
  console.log(`  • 減少載入: ${reduction}%`)
  console.log(`  • 預估TTFB改善: ${(criticalSize / 1024 / 50).toFixed(1)}ms (50KB/s網路)\n`)
  
  return {
    originalSize: totalSize,
    criticalSize,
    reduction,
    criticalCSS,
    inlineTag: generateInlineStyleTag(criticalCSS)
  }
}

/**
 * 生成報告檔案
 */
async function generateReport(result: CSSAnalysisResult) {
  const report = {
    timestamp: new Date().toISOString(),
    analysis: {
      originalSize: result.originalSize,
      criticalSize: result.criticalSize,
      reduction: result.reduction,
      originalSizeKB: (result.originalSize / 1024).toFixed(2),
      criticalSizeKB: (result.criticalSize / 1024).toFixed(2)
    },
    criticalCSS: result.criticalCSS,
    recommendations: [
      '將關鍵CSS內聯到 document.tsx 的 <head> 中',
      '其餘CSS保持外部載入以利瀏覽器快取',
      '考慮使用 media="print" 載入非關鍵CSS',
      '監控實際LCP和FCP指標驗證效果'
    ]
  }
  
  const outputPath = join(process.cwd(), 'critical-css-report.json')
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2))
  console.log(`📋 分析報告已輸出至: ${outputPath}\n`)
  
  // 同時輸出純CSS檔案
  const cssOutputPath = join(process.cwd(), 'critical.css')
  await fs.writeFile(cssOutputPath, result.criticalCSS)
  console.log(`📄 關鍵CSS檔案: ${cssOutputPath}\n`)
}

/**
 * 顯示使用說明
 */
function showUsage() {
  console.log(`
🚀 Critical CSS 優化工具使用說明:

步驟 1: 建立生產構建
  $ npm run build

步驟 2: 執行分析
  $ npm run analyze:critical-css

步驟 3: 手動將生成的 critical.css 內聯到 src/app/layout.tsx

步驟 4: 驗證效果
  $ npm run dev
  觀察 LCP 和 FCP 指標改善

💡 最佳實踐:
  • 關鍵CSS應 < 14KB（壓縮前）
  • 使用 media="print" 載入非關鍵CSS
  • 定期重新分析（CSS變更後）
  • 監控 Core Web Vitals
  `)
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage()
    return
  }
  
  try {
    const result = await analyzeAndExtract()
    
    if (!result) {
      showUsage()
      return
    }
    
    await generateReport(result)
    
    console.log('✅ Critical CSS 分析完成!')
    console.log('\n下一步:')
    console.log('1. 將 critical.css 的內容複製到 src/app/layout.tsx 的 <head> 中')
    console.log('2. 用 <style data-critical>{criticalCSS}</style> 包裝')
    console.log('3. 重新構建並測試性能改善\n')
    
  } catch (error) {
    console.error('❌ 分析失敗:', error)
    process.exit(1)
  }
}

// 執行
if (require.main === module) {
  main()
}

export { analyzeAndExtract, generateReport }