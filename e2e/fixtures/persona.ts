/**
 * Persona Fixture：依 personas.json 注入 context
 * 用於 Persona 驅動 E2E 參數化
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const personasData = require('../../src/__tests__/personas/personas.json') as {
  personas: Persona[]
}

export interface Persona {
  id: string
  name: string
  role: string
  ageGroup: string
  device: 'mobile' | 'tablet' | 'desktop'
  network: '4g' | 'wifi' | 'slow3g'
  accessibility: string
  authState: 'guest' | 'free' | 'paid'
  locale: string
  primaryGoal: string
  expectedFlows: string[]
  painPoints: string[]
  fullFlow: boolean
}

const personas = personasData.personas

/** 取得 fullFlow=true 的 30 種代表性子集（用於完整流程測試） */
export function getFullFlowPersonas(): Persona[] {
  return personas.filter((p: Persona) => p.fullFlow).slice(0, 30)
}

/** 取得首頁+導航用 Persona（70 種輕量測試） */
export function getLightPersonas(): Persona[] {
  return personas.filter((p: Persona) => !p.fullFlow)
}

/** 依 device 取得 viewport */
export function getViewportForDevice(device: Persona['device']) {
  switch (device) {
    case 'mobile':
      return { width: 393, height: 851 }
    case 'tablet':
      return { width: 834, height: 1194 }
    case 'desktop':
    default:
      return { width: 1280, height: 720 }
  }
}
