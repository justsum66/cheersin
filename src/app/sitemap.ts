import type { MetadataRoute } from 'next'
import { getCourseIds } from '@/lib/courses'

/** 196 sitemap.xml：供搜尋引擎索引主要頁面，含 learn/[courseId] */
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

function routeEntry(path: string, changeFrequency: 'daily' | 'weekly' | 'monthly', priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  /** E67 P2：關鍵頁可爬；排除登入後個人頁與訂閱流程，避免 success/cancel 被收錄 */
  const staticRoutes: MetadataRoute.Sitemap = [
    routeEntry('', 'weekly', 1),
    routeEntry('/quiz', 'weekly', 0.9),
    routeEntry('/games', 'daily', 0.8),
    routeEntry('/assistant', 'daily', 0.9),
    routeEntry('/learn', 'weekly', 0.8),
    routeEntry('/pricing', 'weekly', 0.8),
    routeEntry('/login', 'weekly', 0.6),
    routeEntry('/terms', 'monthly', 0.5),
    routeEntry('/privacy', 'monthly', 0.5),
    routeEntry('/status', 'weekly', 0.5),
    routeEntry('/accessibility', 'monthly', 0.4),
  ]
  const learnRoutes: MetadataRoute.Sitemap = getCourseIds().map((courseId) =>
    routeEntry(`/learn/${courseId}`, 'weekly', 0.7)
  )
  return [...staticRoutes, ...learnRoutes]
}
