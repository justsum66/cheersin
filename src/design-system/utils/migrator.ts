/**
 * Design System Migrator - 設計系統遷移工具
 * 將現有樣式遷移到新的設計系統
 */

// ============================================
// 顏色遷移映射
// ============================================
const COLOR_MIGRATION_MAP = {
  // 原始顏色 -> 新語意化顏色
  'dark-50': 'background-surface-primary',
  'dark-100': 'background-surface-secondary',
  'dark-200': 'background-surface-tertiary',
  'dark-950': 'background-surface-inverted',
  
  // 品牌色遷移
  '#8B0000': 'brand-primary-500',
  '#D4AF37': 'brand-secondary-400',
  '#FF2E63': 'brand-primary-500',
  
  // 狀態色遷移
  '#00ff9d': 'state-success-DEFAULT',
  '#ff4d4d': 'state-error-DEFAULT',
  '#ffb700': 'state-warning-DEFAULT',
} as const

// ============================================
// 間距遷移映射
// ============================================
const SPACING_MIGRATION_MAP = {
  // 固定值 -> 網格單位
  '4px': 'space-2xs',
  '8px': 'space-xs',
  '12px': 'space-sm',
  '16px': 'space-md',
  '24px': 'space-lg',
  '32px': 'space-xl',
  '40px': 'space-2xl',
  '48px': 'space-3xl',
  
  // Tailwind 類別 -> 語意化類別
  'p-4': 'p-container-xs',
  'p-6': 'p-container-sm',
  'p-8': 'p-container-md',
  'm-4': 'm-section-sm',
  'm-6': 'm-section-md',
  'gap-4': 'gap-md',
  'gap-6': 'gap-lg',
} as const

// ============================================
// 層級遷移映射
// ============================================
const ELEVATION_MIGRATION_MAP = {
  // 陰影類別 -> 語意化層級
  'shadow-sm': 'elevation-surface',
  'shadow': 'elevation-raised',
  'shadow-md': 'elevation-elevated',
  'shadow-lg': 'elevation-floating',
  'shadow-xl': 'elevation-hover',
  
  // z-index 值 -> 語意化層級
  'z-10': 'z-content',
  'z-20': 'z-component',
  'z-30': 'z-navigation',
  'z-40': 'z-overlay',
  'z-50': 'z-modal',
} as const

// ============================================
// 玻璃擬態遷移映射
// ============================================
const GLASS_MIGRATION_MAP = {
  // 原始玻璃效果 -> 語意化強度
  'bg-white/5 backdrop-blur-sm': 'glass-subtle',
  'bg-white/10 backdrop-blur-md': 'glass-medium',
  'bg-white/20 backdrop-blur-lg': 'glass-strong',
  'bg-white/40 backdrop-blur-xl': 'glass-heavy',
  'bg-white/80 backdrop-blur-2xl': 'glass-solid',
  
  // 自定義玻璃效果
  'glass-card': 'glass-medium',
  'glass-card-spotlight': 'glass-strong',
  'glass-heavy': 'glass-heavy',
} as const

// ============================================
// 遷移工具函數
// ============================================

/**
 * 遷移 CSS 類別
 */
export const migrateCssClasses = (cssString: string): string => {
  let result = cssString
  
  // 顏色遷移
  Object.entries(COLOR_MIGRATION_MAP).forEach(([oldClass, newClass]) => {
    result = result.replace(new RegExp(oldClass, 'g'), newClass)
  })
  
  // 間距遷移
  Object.entries(SPACING_MIGRATION_MAP).forEach(([oldClass, newClass]) => {
    result = result.replace(new RegExp(oldClass, 'g'), newClass)
  })
  
  // 層級遷移
  Object.entries(ELEVATION_MIGRATION_MAP).forEach(([oldClass, newClass]) => {
    result = result.replace(new RegExp(oldClass, 'g'), newClass)
  })
  
  // 玻璃遷移
  Object.entries(GLASS_MIGRATION_MAP).forEach(([oldClass, newClass]) => {
    result = result.replace(new RegExp(oldClass, 'g'), newClass)
  })
  
  return result
}

/**
 * 遷移 Tailwind 類別字串
 */
export const migrateTailwindClasses = (classList: string): string => {
  const classes = classList.split(' ')
  const migratedClasses = classes.map(cls => {
    // 顏色類別遷移
    if (cls in COLOR_MIGRATION_MAP) {
      return COLOR_MIGRATION_MAP[cls as keyof typeof COLOR_MIGRATION_MAP]
    }
    
    // 間距類別遷移
    if (cls in SPACING_MIGRATION_MAP) {
      return SPACING_MIGRATION_MAP[cls as keyof typeof SPACING_MIGRATION_MAP]
    }
    
    // 層級類別遷移
    if (cls in ELEVATION_MIGRATION_MAP) {
      return ELEVATION_MIGRATION_MAP[cls as keyof typeof ELEVATION_MIGRATION_MAP]
    }
    
    // 玻璃類別遷移
    if (cls in GLASS_MIGRATION_MAP) {
      return GLASS_MIGRATION_MAP[cls as keyof typeof GLASS_MIGRATION_MAP]
    }
    
    return cls
  })
  
  return migratedClasses.filter(Boolean).join(' ')
}

/**
 * 遷移 CSS 變數
 */
export const migrateCssVariables = (cssContent: string): string => {
  let result = cssContent
  
  // 遷移顏色變數
  result = result.replace(/var\(--dark-\d+\)/g, (match) => {
    const darkValue = match.match(/--dark-(\d+)/)?.[1]
    if (darkValue) {
      const numericValue = parseInt(darkValue, 10)
      return `var(--background-surface-${numericValue >= 900 ? 'inverted' : 'primary'})`
    }
    return match
  })
  
  // 遷移間距變數
  result = result.replace(/var\(--space-\w+\)/g, (match) => {
    const spaceVar = match.match(/--space-(\w+)/)?.[1]
    if (spaceVar) {
      return `var(--space-${spaceVar})`
    }
    return match
  })
  
  return result
}

/**
 * 生成遷移報告
 */
export const generateMigrationReport = (original: string, migrated: string) => {
  const originalClasses = original.split(' ')
  const migratedClasses = migrated.split(' ')
  
  const changes = originalClasses.filter((cls, index) => cls !== migratedClasses[index])
  const unchanged = originalClasses.filter((cls, index) => cls === migratedClasses[index])
  
  return {
    totalClasses: originalClasses.length,
    changedClasses: changes.length,
    unchangedClasses: unchanged.length,
    changePercentage: Math.round((changes.length / originalClasses.length) * 100),
    changes,
    unchanged,
  }
}

/**
 * 批量遷移文件
 */
export const migrateFiles = async (filePaths: string[]) => {
  const results = []
  
  for (const filePath of filePaths) {
    try {
      // 讀取文件內容
      const fs = await import('fs/promises')
      const content = await fs.readFile(filePath, 'utf-8')
      
      // 執行遷移
      const migratedContent = migrateCssClasses(content)
      
      // 生成報告
      const report = generateMigrationReport(content, migratedContent)
      
      // 儲存遷移後的內容
      await fs.writeFile(filePath, migratedContent, 'utf-8')
      
      results.push({
        file: filePath,
        success: true,
        report,
      })
    } catch (error) {
      results.push({
        file: filePath,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  return results
}

export default {
  migrateCssClasses,
  migrateTailwindClasses,
  migrateCssVariables,
  generateMigrationReport,
  migrateFiles,
  maps: {
    colors: COLOR_MIGRATION_MAP,
    spacing: SPACING_MIGRATION_MAP,
    elevation: ELEVATION_MIGRATION_MAP,
    glass: GLASS_MIGRATION_MAP,
  },
}