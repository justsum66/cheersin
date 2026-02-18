/**
 * F1. 字型排版最佳化系統
 * 精準的行高和字距調整，提升閱讀體驗
 */

// ============================================
// 精細化字型尺寸系統
// ============================================

export const PRECISE_FONT_SIZES = {
  // 標題系統 - 更精細的層次
  headings: {
    h1: {
      mobile: '2rem',      // 32px
      tablet: '2.5rem',    // 40px
      desktop: '3rem',     // 48px
      desktopLarge: '3.5rem' // 56px
    },
    h2: {
      mobile: '1.5rem',    // 24px
      tablet: '1.75rem',   // 28px
      desktop: '2rem',     // 32px
      desktopLarge: '2.25rem' // 36px
    },
    h3: {
      mobile: '1.25rem',   // 20px
      tablet: '1.375rem',  // 22px
      desktop: '1.5rem',   // 24px
      desktopLarge: '1.625rem' // 26px
    },
    h4: {
      mobile: '1.125rem',  // 18px
      tablet: '1.25rem',   // 20px
      desktop: '1.375rem', // 22px
      desktopLarge: '1.5rem' // 24px
    },
    h5: {
      mobile: '1rem',      // 16px
      tablet: '1.125rem',  // 18px
      desktop: '1.25rem',  // 20px
      desktopLarge: '1.375rem' // 22px
    },
    h6: {
      mobile: '0.875rem',  // 14px
      tablet: '1rem',      // 16px
      desktop: '1.125rem', // 18px
      desktopLarge: '1.25rem' // 20px
    }
  },

  // 內文系統 - 精準的閱讀體驗
  body: {
    large: {
      size: '1.125rem',    // 18px
      lineHeight: 1.7,     // 30.6px
      letterSpacing: '0.005em'
    },
    base: {
      size: '1rem',        // 16px
      lineHeight: 1.65,    // 26.4px
      letterSpacing: '0.01em'
    },
    small: {
      size: '0.875rem',    // 14px
      lineHeight: 1.6,     // 22.4px
      letterSpacing: '0.015em'
    },
    caption: {
      size: '0.75rem',     // 12px
      lineHeight: 1.5,     // 18px
      letterSpacing: '0.02em'
    }
  },

  // 特殊用途
  special: {
    hero: {
      mobile: 'clamp(2rem, 4vw + 1rem, 2.5rem)',
      desktop: 'clamp(2.5rem, 3vw + 1.5rem, 3.5rem)',
      lineHeight: 1.15,
      letterSpacing: '-0.03em'
    },
    display: {
      mobile: 'clamp(1.5rem, 3vw + 0.5rem, 2rem)',
      desktop: 'clamp(2rem, 2.5vw + 1rem, 3rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.025em'
    }
  }
} as const

// ============================================
// 行高最佳化系統
// ============================================

export const LINE_HEIGHT_OPTIMIZATION = {
  // 閱讀舒適度優先
  reading: {
    tight: 1.3,      // 緊密 - 標題使用
    compact: 1.45,   // 緊湊 - 短段落
    comfortable: 1.6, // 舒適 - 標準內文
    relaxed: 1.75,   // 放鬆 - 長篇文章
    spacious: 1.9    // 寬鬆 - 特殊排版
  },

  // 內容類型最佳化
  contentTypes: {
    // 新聞文章
    news: {
      lineHeight: 1.65,
      paragraphSpacing: '1.2em'
    },
    // 部落格文章
    blog: {
      lineHeight: 1.7,
      paragraphSpacing: '1.5em'
    },
    // 技術文件
    technical: {
      lineHeight: 1.6,
      paragraphSpacing: '1em'
    },
    // 說明文件
    documentation: {
      lineHeight: 1.65,
      paragraphSpacing: '1.3em'
    }
  }
} as const

// ============================================
// 字距精準調整系統
// ============================================

export const LETTER_SPACING_PRECISION = {
  // 標題字距
  headings: {
    display: '-0.03em',    // 超大標題
    h1: '-0.025em',       // 一級標題
    h2: '-0.02em',        // 二級標題
    h3: '-0.015em',       // 三級標題
    h4: '-0.01em',        // 四級標題
    h5: '-0.005em',       // 五級標題
    h6: '0em'             // 六級標題
  },

  // 內文字距
  body: {
    large: '0.005em',     // 大字內文
    base: '0.01em',       // 標準內文
    small: '0.015em',     // 小字內文
    caption: '0.02em'     // 說明文字
  },

  // 特殊情況
  special: {
    uppercase: '0.05em',  // 大寫文字
    monospace: '0em',     // 等寬字型
    numbers: '-0.01em'    // 數字字距
  }
} as const

// ============================================
// 閱讀體驗優化配置
// ============================================

export const READING_EXPERIENCE = {
  // 理想行長度
  idealLineLength: {
    mobile: '35-45ch',    // 字符數
    tablet: '45-65ch',
    desktop: '65-75ch',
    desktopLarge: '75-85ch'
  },

  // 段落間距
  paragraphSpacing: {
    tight: '0.8em',
    normal: '1em',
    comfortable: '1.2em',
    spacious: '1.5em'
  },

  // 文字對比度
  contrast: {
    high: '7:1',          // WCAG AAA
    normal: '4.5:1',      // WCAG AA
    low: '3:1'            // 最低可接受
  }
} as const

// ============================================
// 響應式排版工具
// ============================================

export interface ResponsiveTypographyProps {
  fontSize: string
  lineHeight: number
  letterSpacing: string
  maxWidth?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

export const createResponsiveTypography = (props: ResponsiveTypographyProps) => {
  return {
    fontSize: props.fontSize,
    lineHeight: props.lineHeight,
    letterSpacing: props.letterSpacing,
    ...(props.maxWidth && { maxWidth: props.maxWidth }),
    ...(props.textAlign && { textAlign: props.textAlign })
  }
}

// ============================================
// 預設排版類別
// ============================================

export const TYPOGRAPHY_CLASSES = {
  // 標題類別
  headings: {
    hero: `text-[${PRECISE_FONT_SIZES.special.hero.mobile}] 
           md:text-[${PRECISE_FONT_SIZES.special.hero.desktop}] 
           leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
           tracking-[${LETTER_SPACING_PRECISION.headings.display}]`,
    
    h1: `text-[${PRECISE_FONT_SIZES.headings.h1.mobile}] 
         md:text-[${PRECISE_FONT_SIZES.headings.h1.tablet}] 
         lg:text-[${PRECISE_FONT_SIZES.headings.h1.desktop}] 
         xl:text-[${PRECISE_FONT_SIZES.headings.h1.desktopLarge}] 
         leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
         tracking-[${LETTER_SPACING_PRECISION.headings.h1}]`,
    
    h2: `text-[${PRECISE_FONT_SIZES.headings.h2.mobile}] 
         md:text-[${PRECISE_FONT_SIZES.headings.h2.tablet}] 
         lg:text-[${PRECISE_FONT_SIZES.headings.h2.desktop}] 
         xl:text-[${PRECISE_FONT_SIZES.headings.h2.desktopLarge}] 
         leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
         tracking-[${LETTER_SPACING_PRECISION.headings.h2}]`,
    
    h3: `text-[${PRECISE_FONT_SIZES.headings.h3.mobile}] 
         md:text-[${PRECISE_FONT_SIZES.headings.h3.tablet}] 
         lg:text-[${PRECISE_FONT_SIZES.headings.h3.desktop}] 
         xl:text-[${PRECISE_FONT_SIZES.headings.h3.desktopLarge}] 
         leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
         tracking-[${LETTER_SPACING_PRECISION.headings.h3}]`,
    
    h4: `text-[${PRECISE_FONT_SIZES.headings.h4.mobile}] 
         md:text-[${PRECISE_FONT_SIZES.headings.h4.tablet}] 
         lg:text-[${PRECISE_FONT_SIZES.headings.h4.desktop}] 
         xl:text-[${PRECISE_FONT_SIZES.headings.h4.desktopLarge}] 
         leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
         tracking-[${LETTER_SPACING_PRECISION.headings.h4}]`,
    
    h5: `text-[${PRECISE_FONT_SIZES.headings.h5.mobile}] 
         md:text-[${PRECISE_FONT_SIZES.headings.h5.tablet}] 
         lg:text-[${PRECISE_FONT_SIZES.headings.h5.desktop}] 
         xl:text-[${PRECISE_FONT_SIZES.headings.h5.desktopLarge}] 
         leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
         tracking-[${LETTER_SPACING_PRECISION.headings.h5}]`,
    
    h6: `text-[${PRECISE_FONT_SIZES.headings.h6.mobile}] 
         md:text-[${PRECISE_FONT_SIZES.headings.h6.tablet}] 
         lg:text-[${PRECISE_FONT_SIZES.headings.h6.desktop}] 
         xl:text-[${PRECISE_FONT_SIZES.headings.h6.desktopLarge}] 
         leading-[${LINE_HEIGHT_OPTIMIZATION.reading.tight}] 
         tracking-[${LETTER_SPACING_PRECISION.headings.h6}]`
  },

  // 內文類別
  body: {
    large: `text-[${PRECISE_FONT_SIZES.body.large.size}] 
            leading-[${PRECISE_FONT_SIZES.body.large.lineHeight}] 
            tracking-[${PRECISE_FONT_SIZES.body.large.letterSpacing}]`,
    
    base: `text-[${PRECISE_FONT_SIZES.body.base.size}] 
           leading-[${PRECISE_FONT_SIZES.body.base.lineHeight}] 
           tracking-[${PRECISE_FONT_SIZES.body.base.letterSpacing}]`,
    
    small: `text-[${PRECISE_FONT_SIZES.body.small.size}] 
            leading-[${PRECISE_FONT_SIZES.body.small.lineHeight}] 
            tracking-[${PRECISE_FONT_SIZES.body.small.letterSpacing}]`,
    
    caption: `text-[${PRECISE_FONT_SIZES.body.caption.size}] 
              leading-[${PRECISE_FONT_SIZES.body.caption.lineHeight}] 
              tracking-[${PRECISE_FONT_SIZES.body.caption.letterSpacing}]`
  },

  // 閱讀優化類別
  reading: {
    news: `leading-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.news.lineHeight}] 
           [&_p]:mb-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.news.paragraphSpacing}]`,
    
    blog: `leading-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.blog.lineHeight}] 
           [&_p]:mb-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.blog.paragraphSpacing}]`,
    
    technical: `leading-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.technical.lineHeight}] 
                [&_p]:mb-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.technical.paragraphSpacing}]`,
    
    documentation: `leading-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.documentation.lineHeight}] 
                    [&_p]:mb-[${LINE_HEIGHT_OPTIMIZATION.contentTypes.documentation.paragraphSpacing}]`
  }
} as const

// ============================================
// 工具函數
// ============================================

export const getOptimalLineHeight = (fontSize: number, contentLength: 'short' | 'medium' | 'long'): number => {
  const baseLineHeight = fontSize < 16 ? 1.6 : fontSize < 20 ? 1.5 : 1.4
  
  switch (contentLength) {
    case 'short':
      return baseLineHeight - 0.1
    case 'long':
      return baseLineHeight + 0.2
    default:
      return baseLineHeight
  }
}

export const getOptimalLetterSpacing = (fontSize: number, textType: 'heading' | 'body' | 'caption'): string => {
  if (textType === 'heading') {
    return fontSize > 32 ? '-0.03em' : fontSize > 24 ? '-0.02em' : '-0.01em'
  } else if (textType === 'caption') {
    return '0.02em'
  } else {
    return fontSize > 18 ? '0.005em' : '0.01em'
  }
}

// 預設導出
export default {
  PRECISE_FONT_SIZES,
  LINE_HEIGHT_OPTIMIZATION,
  LETTER_SPACING_PRECISION,
  READING_EXPERIENCE,
  TYPOGRAPHY_CLASSES,
  createResponsiveTypography,
  getOptimalLineHeight,
  getOptimalLetterSpacing
}