import { logger } from '@/lib/logger'

export type WouldYouRatherCategory = 'normal' | 'adult'

export interface WouldYouRatherItem {
    id: number
    a: string
    b: string
}

const CATEGORIES: WouldYouRatherCategory[] = ['normal', 'adult']

export const CATEGORY_LABEL: Record<WouldYouRatherCategory, string> = {
    normal: '一般',
    adult: '18+ 辣味',
}

async function loadQuestionsFromJson(): Promise<Record<WouldYouRatherCategory, WouldYouRatherItem[]>> {
    try {
        const res = await fetch('/data/wouldYouRather.json')
        if (!res.ok) throw new Error('Failed to fetch data')
        const mod = await res.json()
        const q = (mod as { questions?: Record<string, Array<{ id: number; a: string; b: string }>> }).questions

        if (!q || typeof q !== 'object') {
            return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<WouldYouRatherCategory, WouldYouRatherItem[]>)
        }
        const out = {} as Record<WouldYouRatherCategory, WouldYouRatherItem[]>
        for (const cat of CATEGORIES) {
            const list = q[cat]
            out[cat] = Array.isArray(list) ? list.filter((x): x is WouldYouRatherItem => x?.a != null && x?.b != null) : []
        }
        return out
    } catch (error) {
        logger.error('Failed to load WouldYouRather data:', { err: error instanceof Error ? error.message : String(error) })
        return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<WouldYouRatherCategory, WouldYouRatherItem[]>)
    }
}

export async function getQuestionsByCategory(category: WouldYouRatherCategory | 'all'): Promise<WouldYouRatherItem[]> {
    const questionsByCategory = await loadQuestionsFromJson()

    if (category === 'all') {
        return CATEGORIES.flatMap((cat) => questionsByCategory[cat])
    }
    return [...questionsByCategory[category]]
}
