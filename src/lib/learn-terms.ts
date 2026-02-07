/**
 * 4 專業術語中英對照：品酒學院術語表
 * 依字串長度降序排列，避免短詞覆蓋長詞（如 單寧 先於 單）
 */
export const TERM_MAP: Record<string, string> = {
  精米步合: 'Rice Polishing Ratio (Seimaibuai)',
  單一麥芽: 'Single Malt',
  加烈酒: 'Fortified Wine',
  貴腐菌: 'Noble Rot (Botrytis)',
  風土: 'Terroir',
  單寧: 'Tannin',
  發酵: 'Fermentation',
  蒸餾: 'Distillation',
  酒體: 'Body',
  餘韻: 'Finish',
  酸度: 'Acidity',
  醒酒: 'Decanting',
  品種: 'Grape Variety',
  產區: 'Region / Appellation',
  酒標: 'Wine Label',
  橡木: 'Oak',
  陳年: 'Aging',
  乾型: 'Dry',
  甜型: 'Sweet',
  氣泡酒: 'Sparkling Wine',
  靜態酒: 'Still Wine',
  浸漬: 'Maceration',
  壓榨: 'Pressing',
  萃取: 'Extraction',
  酵母: 'Yeast',
  基酒: 'Base Spirit',
  調和: 'Blending',
  酒莊: 'Winery / Château',
  陳釀: 'Aging / Maturation',
  桶陳: 'Barrel Aging',
}

/** Phase 1 D4.1: 法語發音術語表（可用 Web Speech API 發音） */
export const FRENCH_TERMS: Record<string, { pronunciation: string; meaning: string; lang: string }> = {
  'Terroir': { pronunciation: 'teh-RWAHR', meaning: '風土', lang: 'fr-FR' },
  'Champagne': { pronunciation: 'shahm-PAN-yuh', meaning: '香檳', lang: 'fr-FR' },
  'Bordeaux': { pronunciation: 'bor-DOH', meaning: '波爾多', lang: 'fr-FR' },
  'Burgundy': { pronunciation: 'bur-GUN-dee', meaning: '勃根地', lang: 'en-US' },
  'Bourgogne': { pronunciation: 'boor-GON-yuh', meaning: '勃根地', lang: 'fr-FR' },
  'Brut': { pronunciation: 'BROO', meaning: '極乾型', lang: 'fr-FR' },
  'Demi-Sec': { pronunciation: 'deh-mee-SEK', meaning: '半甜', lang: 'fr-FR' },
  'Crémant': { pronunciation: 'kreh-MAHNT', meaning: '複式氣泡酒', lang: 'fr-FR' },
  'Château': { pronunciation: 'sha-TOH', meaning: '酒莊', lang: 'fr-FR' },
  'Pinot Noir': { pronunciation: 'PEE-noh NWAHR', meaning: '黑皮諾', lang: 'fr-FR' },
  'Chardonnay': { pronunciation: 'shar-doh-NAY', meaning: '夏多內', lang: 'fr-FR' },
  'Cabernet Sauvignon': { pronunciation: 'ka-ber-NAY soh-veen-YOHN', meaning: '卡本內 蘇維翁', lang: 'fr-FR' },
  'Merlot': { pronunciation: 'mer-LOH', meaning: '梅洛', lang: 'fr-FR' },
  'Sauvignon Blanc': { pronunciation: 'soh-veen-YOHN BLAHN', meaning: '長相思', lang: 'fr-FR' },
  'Riesling': { pronunciation: 'REEZ-ling', meaning: '麗絲玲', lang: 'de-DE' },
  'Prosecco': { pronunciation: 'pro-SEK-oh', meaning: '普羅塞克', lang: 'it-IT' },
  'Cava': { pronunciation: 'KAH-vah', meaning: '卡瓦', lang: 'es-ES' },
  'Sommelier': { pronunciation: 'sohm-mel-YAY', meaning: '侍酒師', lang: 'fr-FR' },
}

/** Phase 1 D4.1: 使用 Web Speech API 發音 */
export function speakTerm(term: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  
  const termData = FRENCH_TERMS[term]
  if (!termData) return false
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(term)
  utterance.lang = termData.lang
  utterance.rate = 0.8 // Slower for clarity
  utterance.pitch = 1
  
  window.speechSynthesis.speak(utterance)
  return true
}

/** Phase 1 D4.1: 檢查是否支援語音合成 */
export function hasSpeechSupport(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** 依長度降序的術語鍵，用於正則匹配 */
const TERM_KEYS = Object.keys(TERM_MAP).sort((a, b) => b.length - a.length)

/** Phase 2 F2.1: 依長度降序的法語術語鍵 */
const FRENCH_TERM_KEYS = Object.keys(FRENCH_TERMS).sort((a, b) => b.length - a.length)

/** Phase 2 F2.1: 合併中文術語與外語術語進行匹配 */
const ALL_TERM_KEYS = [...new Set([...TERM_KEYS, ...FRENCH_TERM_KEYS])].sort((a, b) => b.length - a.length)

export interface ParsedTerm {
  term: string
  en: string
  /** Phase 2 F2.1: 可發音術語資訊 */
  pronunciation?: {
    text: string
    lang: 'fr-FR' | 'it-IT' | 'de-DE' | 'es-ES' | 'en-US'
    meaning: string
  }
}

/**
 * 將內容中的術語替換為帶 title 的 span（用於 tooltip）
 * 回傳 React 節點陣列，可搭配 key 使用
 * Phase 2 F2.1: 現在也支援法語/義大利語等外語術語的發音標記
 */
export function parseContentWithTerms(text: string): (string | ParsedTerm)[] {
  if (!text || !ALL_TERM_KEYS.length) return [text]
  const parts: (string | ParsedTerm)[] = []
  const pattern = new RegExp(`(${ALL_TERM_KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  let lastIndex = 0
  let m
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index))
    }
    const term = m[1]
    const frenchData = FRENCH_TERMS[term]
    const result: ParsedTerm = {
      term,
      en: TERM_MAP[term] ?? frenchData?.meaning ?? term,
    }
    // Phase 2 F2.1: 添加發音資訊
    if (frenchData) {
      result.pronunciation = {
        text: term,
        lang: frenchData.lang as 'fr-FR' | 'it-IT' | 'de-DE' | 'es-ES' | 'en-US',
        meaning: frenchData.meaning,
      }
    }
    parts.push(result)
    lastIndex = m.index + m[1].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length > 0 ? parts : [text]
}
