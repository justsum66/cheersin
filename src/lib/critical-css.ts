/**
 * A3. Critical CSS 提取工具
 * 自動分析首屏渲染所需的核心CSS，實現內聯關鍵樣式
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// 首屏關鍵選擇器（根據Cheersin首頁結構）
const CRITICAL_SELECTORS = [
  // 基礎樣式
  'html', 'body', '*', '*::before', '*::after',
  
  // 版面配置
  '.container', '.max-w-screen-xl', '.mx-auto', '.px-4', '.py-6',
  
  // 文字樣式
  '.text-4xl', '.text-3xl', '.text-2xl', '.text-xl', '.text-lg', '.text-base',
  '.font-bold', '.font-semibold', '.font-medium', '.font-normal',
  '.text-white', '.text-gray-100', '.text-gray-200', '.text-gray-300',
  '.text-primary', '.text-primary-foreground',
  
  // 背景與顏色
  '.bg-black', '.bg-gray-900', '.bg-gray-950', '.bg-primary',
  '.bg-gradient-to-r', '.bg-gradient-to-b', '.from-black', '.to-gray-900',
  
  // 按鈕元件
  '.btn', '.btn-primary', '.btn-secondary', '.btn-lg', '.btn-xl',
  '.rounded-lg', '.rounded-xl', '.rounded-full',
  '.px-4', '.px-6', '.px-8', '.py-2', '.py-3', '.py-4',
  
  // 導航列
  'nav', '.fixed', '.top-0', '.left-0', '.right-0', '.z-50',
  '.flex', '.items-center', '.justify-between',
  
  // 卡片元件
  '.card', '.card-header', '.card-content', '.card-footer',
  '.border', '.border-gray-800', '.rounded-2xl', '.shadow-lg',
  '.bg-white/5', '.backdrop-blur-sm',
  
  // Hero區塊
  '.hero', '.hero-content', '.hero-title', '.hero-subtitle', '.hero-cta',
  '.min-h-screen', '.flex-col', '.items-center', '.justify-center',
  
  // 動畫相關
  '.animate-fade-in', '.animate-slide-up', '.transition-all', '.duration-300',
  '.opacity-0', '.opacity-100', '.translate-y-4', '.translate-y-0',
  
  // 響應式斷點
  '@media (min-width: 640px)', '@media (min-width: 768px)', 
  '@media (min-width: 1024px)', '@media (min-width: 1280px)',
  
  // 滑鼠懸停效果
  '.hover\\:bg-white\\/10', '.hover\\:text-white', '.hover\\:scale-105'
]

// 首屏使用的元件類別
const CRITICAL_COMPONENTS = [
  'Button', 'Card', 'Badge', 'Avatar', 'Skeleton',
  'Navbar', 'Hero', 'Feature', 'CTA', 'Footer'
]

/**
 * 分析CSS並提取關鍵樣式
 * @param cssContent CSS內容
 * @returns 關鍵CSS
 */
export function extractCriticalCSS(cssContent: string): string {
  const lines = cssContent.split('\n')
  const criticalLines: string[] = []
  let inMediaQuery = false
  let mediaQueryBuffer: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 跳過空行和註解
    if (!line || line.startsWith('/*') || line.startsWith('*')) {
      continue
    }
    
    // 處理媒體查詢
    if (line.includes('@media')) {
      inMediaQuery = true
      mediaQueryBuffer = [line]
      continue
    }
    
    if (inMediaQuery && line === '}') {
      // 結束媒體查詢
      if (mediaQueryBuffer.length > 1) {
        criticalLines.push(...mediaQueryBuffer, line)
      }
      inMediaQuery = false
      mediaQueryBuffer = []
      continue
    }
    
    if (inMediaQuery) {
      mediaQueryBuffer.push(lines[i])
      // 檢查媒體查詢內部是否包含關鍵選擇器
      if (isCriticalLine(line)) {
        // 媒體查詢包含關鍵樣式，保留整個查詢
      }
      continue
    }
    
    // 檢查一般規則是否關鍵
    if (isCriticalLine(line) || isCriticalSelector(line)) {
      criticalLines.push(lines[i])
    }
  }
  
  return criticalLines.join('\n')
}

/**
 * 判斷行是否包含關鍵選擇器
 */
function isCriticalLine(line: string): boolean {
  return CRITICAL_SELECTORS.some(selector => 
    line.includes(selector.replace(/\\/g, ''))
  )
}

/**
 * 判斷選擇器是否關鍵
 */
function isCriticalSelector(selector: string): boolean {
  const cleanSelector = selector
    .replace(/[{}]/g, '')
    .trim()
    .split(',')[0] // 只檢查第一個選擇器
    
  if (!cleanSelector) return false
  
  // 直接匹配
  if (CRITICAL_SELECTORS.includes(cleanSelector)) {
    return true
  }
  
  // 模糊匹配（包含關鍵詞）
  const keywords = [
    'html', 'body', 'container', 'btn', 'card', 'hero',
    'text-', 'bg-', 'font-', 'w-', 'h-', 'p-', 'm-',
    'flex', 'grid', 'fixed', 'absolute', 'relative'
  ]
  
  return keywords.some(keyword => cleanSelector.includes(keyword))
}

/**
 * 從多個CSS檔案提取關鍵樣式
 * @param cssFiles CSS檔案路徑陣列
 * @returns 合併的關鍵CSS
 */
export async function extractFromFiles(cssFiles: string[]): Promise<string> {
  let combinedCSS = ''
  
  for (const file of cssFiles) {
    try {
      const content = readFileSync(file, 'utf-8')
      combinedCSS += content + '\n'
    } catch (error) {
      console.warn(`無法讀取檔案: ${file}`, error)
    }
  }
  
  return extractCriticalCSS(combinedCSS)
}

/**
 * 生成內聯CSS標籤
 * @param criticalCSS 關鍵CSS內容
 * @returns HTML style標籤
 */
export function generateInlineStyleTag(criticalCSS: string): string {
  return `<style data-critical="true">${criticalCSS}</style>`
}

/**
 * 移除已內聯的關鍵CSS（避免重複）
 * @param cssContent 原始CSS
 * @param criticalCSS 已內聯的關鍵CSS
 * @returns 非關鍵CSS
 */
export function removeInlinedCSS(cssContent: string, criticalCSS: string): string {
  // 簡單的字串移除（實際專案中可能需要更精確的CSS解析）
  return cssContent.replace(criticalCSS, '').trim()
}

/**
 * 分析Next.js應用的關鍵CSS需求
 */
export interface CriticalCSSAnalysis {
  totalCSS: number // 總CSS大小
  criticalCSS: number // 關鍵CSS大小
  reduction: number // 減少百分比
  recommendations: string[] // 優化建議
}

export async function analyzeNextApp(): Promise<CriticalCSSAnalysis> {
  const cssFiles = [
    join(process.cwd(), '.next/static/css/*.css')
  ]
  
  const criticalCSS = await extractFromFiles(cssFiles)
  const criticalSize = Buffer.byteLength(criticalCSS, 'utf-8')
  
  // 估算總CSS大小（實際專案中應該從構建輸出獲取）
  const totalSize = criticalSize * 3 // 假設關鍵CSS約佔總CSS的33%
  
  const reduction = Math.round((1 - (criticalSize / totalSize)) * 100)
  
  const recommendations = [
    `關鍵CSS大小: ${(criticalSize / 1024).toFixed(2)} KB`,
    `預估總CSS: ${(totalSize / 1024).toFixed(2)} KB`,
    `減少載入: ${reduction}%`,
    '建議在 document.tsx 中內聯關鍵CSS',
    '其餘CSS保持外部載入以利快取'
  ]
  
  return {
    totalCSS: totalSize,
    criticalCSS: criticalSize,
    reduction,
    recommendations
  }
}

// 預設匯出
export default {
  extractCriticalCSS,
  extractFromFiles,
  generateInlineStyleTag,
  removeInlinedCSS,
  analyzeNextApp
}