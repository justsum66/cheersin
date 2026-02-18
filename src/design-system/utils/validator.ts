/**
 * Design System Validator - 設計系統驗證工具
 * 驗證 tokens 的一致性與正確性
 */

import { DESIGN_SYSTEM } from '../tokens'

// ============================================
// 顏色系統驗證
// ============================================
export const validateColors = () => {
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: [] as string[],
  }

  // 驗證品牌色
  Object.entries(DESIGN_SYSTEM.colors.brand).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([key, value]) => {
      results.total++
      if (typeof value === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        results.valid++
      } else {
        results.invalid++
        results.errors.push(`Invalid color format: ${category}.${key} = ${value}`)
      }
    })
  })

  // 驗證語意色
  Object.entries(DESIGN_SYSTEM.colors.state).forEach(([key, value]) => {
    results.total++
    if (value.DEFAULT && typeof value.DEFAULT === 'string') {
      results.valid++
    } else {
      results.invalid++
      results.errors.push(`Invalid state color: ${key}`)
    }
  })

  return results
}

// ============================================
// 間距系統驗證
// ============================================
export const validateSpacing = () => {
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: [] as string[],
  }

  // 驗證 8px 網格系統
  Object.entries(DESIGN_SYSTEM.spacing.grid).forEach(([key, value]) => {
    results.total++
    if (typeof value === 'string' && value.endsWith('rem')) {
      const remValue = parseFloat(value)
      const pixels = remValue * 16
      if (pixels % 8 === 0 || pixels === 0) {
        results.valid++
      } else {
        results.invalid++
        results.errors.push(`Spacing not aligned to 8px grid: ${key} = ${value} (${pixels}px)`)
      }
    } else {
      results.invalid++
      results.errors.push(`Invalid spacing format: ${key} = ${value}`)
    }
  })

  return results
}

// ============================================
// 層級系統驗證
// ============================================
export const validateElevation = () => {
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: [] as string[],
  }

  // 驗證 elevation 層級
  Object.entries(DESIGN_SYSTEM.elevation.levels).forEach(([key, value]) => {
    results.total++
    if (value.shadow && typeof value.shadow === 'string') {
      results.valid++
    } else {
      results.invalid++
      results.errors.push(`Invalid elevation shadow: ${key}`)
    }
  })

  // 驗證 z-index 映射
  Object.entries(DESIGN_SYSTEM.elevation.zIndexMap).forEach(([key, value]) => {
    results.total++
    if (typeof value === 'number' && value >= 0) {
      results.valid++
    } else {
      results.invalid++
      results.errors.push(`Invalid z-index mapping: ${key} = ${value}`)
    }
  })

  return results
}

// ============================================
// 玻璃擬態系統驗證
// ============================================
export const validateGlass = () => {
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: [] as string[],
  }

  // 驗證玻璃強度
  Object.entries(DESIGN_SYSTEM.glass.intensity).forEach(([key, value]) => {
    results.total++
    const isValid = 
      typeof value.backgroundOpacity === 'number' &&
      typeof value.borderOpacity === 'number' &&
      typeof value.backdropBlur === 'string' &&
      value.backgroundOpacity >= 0 && value.backgroundOpacity <= 1 &&
      value.borderOpacity >= 0 && value.borderOpacity <= 1
    
    if (isValid) {
      results.valid++
    } else {
      results.invalid++
      results.errors.push(`Invalid glass intensity: ${key}`)
    }
  })

  return results
}

// ============================================
// 完整系統驗證
// ============================================
export const validateDesignSystem = () => {
  const colorResults = validateColors()
  const spacingResults = validateSpacing()
  const elevationResults = validateElevation()
  const glassResults = validateGlass()

  return {
    colors: colorResults,
    spacing: spacingResults,
    elevation: elevationResults,
    glass: glassResults,
    summary: {
      total: colorResults.total + spacingResults.total + elevationResults.total + glassResults.total,
      valid: colorResults.valid + spacingResults.valid + elevationResults.valid + glassResults.valid,
      invalid: colorResults.invalid + spacingResults.invalid + elevationResults.invalid + glassResults.invalid,
      isValid: (colorResults.invalid + spacingResults.invalid + elevationResults.invalid + glassResults.invalid) === 0,
    },
  }
}

// ============================================
// 生成驗證報告
// ============================================
export const generateValidationReport = () => {
  const results = validateDesignSystem()
  
  console.log('🎨 Design System Validation Report')
  console.log('====================================')
  console.log(`✅ Valid tokens: ${results.summary.valid}`)
  console.log(`❌ Invalid tokens: ${results.summary.invalid}`)
  console.log(`📊 Total tokens: ${results.summary.total}`)
  console.log(`🎯 System status: ${results.summary.isValid ? 'VALID' : 'INVALID'}`)
  console.log('')
  
  if (results.colors.errors.length > 0) {
    console.log('🎨 Color System Errors:')
    results.colors.errors.forEach(error => console.log(`  - ${error}`))
    console.log('')
  }
  
  if (results.spacing.errors.length > 0) {
    console.log('📏 Spacing System Errors:')
    results.spacing.errors.forEach(error => console.log(`  - ${error}`))
    console.log('')
  }
  
  if (results.elevation.errors.length > 0) {
    console.log('🏗️ Elevation System Errors:')
    results.elevation.errors.forEach(error => console.log(`  - ${error}`))
    console.log('')
  }
  
  if (results.glass.errors.length > 0) {
    console.log('🪟 Glass System Errors:')
    results.glass.errors.forEach(error => console.log(`  - ${error}`))
    console.log('')
  }
  
  return results
}

export default {
  validateColors,
  validateSpacing,
  validateElevation,
  validateGlass,
  validateDesignSystem,
  generateValidationReport,
}