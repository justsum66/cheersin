'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Award, Share2, Download, FileDown } from 'lucide-react'
import { logger } from '@/lib/logger'
import { getSommelierLevel } from '@/lib/gamification'

const PROGRESS_KEY = 'cheersin_learn_progress'
const CERT_NAME_KEY = 'cheersin_cert_name'

/** 171–175 課程完成證書；85 證書個人化（姓名） */
export default function CertificatePage() {
  const [progress, setProgress] = useState<Record<string, { completed: number; total: number }>>({})
  const [courseName, setCourseName] = useState<string>('')
  const [completedAt, setCompletedAt] = useState<string>('')
  const [certId, setCertId] = useState<string>('')
  const [shareUrl, setShareUrl] = useState('')
  const [userName, setUserName] = useState('')
  const [editName, setEditName] = useState('')
  const [downloadLoading, setDownloadLoading] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const name = localStorage.getItem(CERT_NAME_KEY)
      if (name) setUserName(name)
      const raw = localStorage.getItem(PROGRESS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, { completed: number; total: number; completedAt?: string }>
      setProgress(parsed)
      const firstComplete = Object.entries(parsed).find(([, v]) => v.total > 0 && v.completed >= v.total)
      if (typeof window !== 'undefined') setShareUrl(window.location.href)
      if (firstComplete) {
        const [cid, val] = firstComplete
        const names: Record<string, string> = {
          'wine-basics': '葡萄酒入門',
          'white-wine': '白酒探索',
          'whisky-101': '威士忌基礎',
          'sake-intro': '清酒之道',
          'craft-beer': '精釀啤酒探索',
          'cocktail-basics': '調酒基礎',
          'champagne-sparkling': '氣泡酒與香檳',
          'rum-basics': '蘭姆酒入門',
          'gin-basics': '琴酒入門',
          'tequila-mezcal': '龍舌蘭與梅茲卡爾',
          'wine-advanced': '葡萄酒進階',
          'brandy-cognac': '白蘭地與干邑',
          'cocktail-classics': '經典調酒實作',
          'wine-pairing': '餐酒搭配進階',
          'sake-advanced': '清酒進階',
          'whisky-single-malt': '單一麥芽威士忌',
          'natural-wine': '自然酒入門',
          'low-abv': '低酒精飲品',
          'tasting-notes': '品飲筆記與盲飲',
          'home-bar': '居家酒吧入門',
          'wset-l1-spirits': 'WSET L1 烈酒入門',
          'wset-l2-wines': 'WSET L2 葡萄酒產區',
          'wset-l3-viticulture': '葡萄栽培與風土',
          'wset-l3-tasting': '系統化品飲分析',
          'wset-d1-production': '葡萄酒生產原理',
          'wset-d2-business': '葡萄酒商業與行銷',
          'wset-d3-world': '世界葡萄酒深度',
          'fortified-wines': '加烈酒：波特與雪莉',
          'cms-intro-somm': 'CMS 入門侍酒師',
          'cms-deductive-tasting': 'CMS 演繹品飲法',
          'cms-service': '侍酒服務實務',
          'cms-advanced-regions': '侍酒師產區與品種',
          'mw-viticulture': 'MW 葡萄栽培深度',
          'mw-vinification': 'MW 釀造與裝瓶前',
          'mw-business': 'MW 葡萄酒商業',
          'organic-biodynamic': '有機與生物動力法',
          'wine-law-regions': '葡萄酒法規與產區',
          'dessert-wines': '甜酒與貴腐',
          'beer-cider': '啤酒與 Cider 進階',
          'somm-exam-prep': '認證考試準備總覽',
          'wset-d4-sparkling-pro': '氣泡酒專業',
          'quick-wine-5min': '5 分鐘快懂葡萄酒',
          'quick-cocktail-5min': '5 分鐘快懂調酒',
          'dating-wine-select': '約會選酒速成',
          'quick-whisky-5min': '5 分鐘快懂威士忌',
          'party-wine-select': '聚餐選酒速成',
          'home-sipping': '在家小酌入門',
          'wine-label-read': '酒標一眼看懂',
          'supermarket-wine': '超市選酒不求人',
          'beginner-faq': '新手常見問題 FAQ',
          'bordeaux-deep': '產區深度：波爾多',
          'burgundy-deep': '產區深度：勃根地',
          'italy-deep': '產區深度：義大利',
          'new-world-deep': '產區深度：新世界',
          'blind-tasting-advanced': '盲品實戰進階',
          'viral-trends-2025': '2025-2026 酒類趨勢',
        }
        setCourseName(names[cid] ?? cid)
        if (val.completedAt) setCompletedAt(val.completedAt)
        setCertId(`CI-${cid}-${(val.completedAt ?? '').replace(/-/g, '')}-${Math.abs(cid.split('').reduce((a, b) => a + b.charCodeAt(0), 0)).toString(36).slice(0, 6)}`)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const hasAnyComplete = Object.values(progress).some((v) => v.total > 0 && v.completed >= v.total)
  const completedCourseCount = Object.values(progress).filter((v) => v.total > 0 && v.completed >= v.total).length
  const sommelierLevel = getSommelierLevel(completedCourseCount)

  /** E35：證書下載/分享追蹤 — 事件名 certificate_download、certificate_share（id 為來源） */
  const trackCertificateAction = (action: 'download' | 'share') => {
    try {
      const eventName = action === 'download' ? 'certificate_download' : 'certificate_share'
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: eventName, value: 1, id: 'learn' }),
      }).catch(() => {})
    } catch { /* noop */ }
  }
  const trackCertificateShare = (source: 'linkedin' | 'line') => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'certificate_share', value: 1, id: source }),
      }).catch(() => {})
    } catch { /* noop */ }
  }

  /** 82 證書下載 PNG */
  const handleDownloadPng = async () => {
    const el = certRef.current
    if (!el) return
    trackCertificateAction('download')
    setDownloadLoading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, {
        backgroundColor: '#0a0a1a',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png', 0.95))
      if (!blob) throw new Error('toBlob failed')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cheersin-證書-${courseName}-${certId || 'cert'}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      logger.error('Download PNG failed', { err: e instanceof Error ? e.message : String(e) })
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <main id="learn-main" className="min-h-screen px-4 pt-0 pb-16 safe-area-px safe-area-pb" tabIndex={-1} role="main" aria-label="課程證書">
      <div className="max-w-2xl mx-auto px-2 sm:px-0">
        <Link
          href="/learn"
          className="min-h-[48px] min-w-[48px] inline-flex items-center gap-1 text-white/60 hover:text-white mb-6 games-focus-ring rounded"
        >
          <ChevronLeft className="w-5 h-5" />
          返回學堂
        </Link>

        <h1 className="text-3xl font-display font-bold text-white mb-2">課程證書</h1>
        <p className="text-white/50 text-sm mb-8">
          完成課程後可在此取得證書；未來支援分享至 LinkedIn 與 NFT 證書。
        </p>

        {!hasAnyComplete && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <Award className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 mb-4">尚未完成任何課程</p>
            <Link href="/learn" className="btn-primary min-h-[48px] inline-flex items-center justify-center games-focus-ring rounded">
              前往學堂
            </Link>
          </div>
        )}

        {hasAnyComplete && (
          <div className="rounded-2xl bg-white/5 border border-primary-500/30 p-6 sm:p-8 text-center shadow-lg">
            <div ref={certRef} className="pb-6 border-b border-white/10 mb-6">
            <Award className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">恭喜完成</h2>
            {userName ? (
              <p className="text-white/80 text-sm mb-1">授予 {userName}</p>
            ) : (
              <div className="mb-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="輸入您的姓名"
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm w-48 text-center"
                  onBlur={() => {
                    const n = editName.trim()
                    if (n) {
                      setUserName(n)
                      try { localStorage.setItem(CERT_NAME_KEY, n) } catch {}
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const n = editName.trim()
                      if (n) {
                        setUserName(n)
                        try { localStorage.setItem(CERT_NAME_KEY, n) } catch {}
                        ;(e.target as HTMLInputElement).blur()
                      }
                    }
                  }}
                />
                <p className="text-white/40 text-xs mt-1">輸入後按 Enter 或點擊他處儲存</p>
              </div>
            )}
            {userName && (
              <button
                type="button"
                onClick={() => { setUserName(''); setEditName(userName); try { localStorage.removeItem(CERT_NAME_KEY) } catch {} }}
                className="block mx-auto text-white/40 text-xs hover:text-white/60 mb-1"
              >
                變更姓名
              </button>
            )}
            <p className="text-primary-300 font-display text-2xl mb-2">{courseName}</p>
            {completedAt && (
              <p className="text-white/50 text-sm mb-1">完成日期：{completedAt.replace(/-/g, '/')}</p>
            )}
            {certId && <p className="text-white/40 text-xs mb-2">證書編號：{certId}</p>}
            {sommelierLevel && (
              <p className="text-amber-400 text-sm font-medium mb-4">品酒師等級認證：{sommelierLevel}</p>
            )}
            <p className="text-white/60 text-sm mb-6">
              Cheersin 品酒學院 · 本證書代表您已完成該課程之學習內容
            </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloadLoading}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium disabled:opacity-60 games-focus-ring"
                aria-label="下載證書 PNG"
              >
                <Download className="w-5 h-5" />
                {downloadLoading ? '下載中…' : '下載 PNG'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring"
                aria-label="列印或存成 PDF"
              >
                <FileDown className="w-5 h-5" />
                列印 / 存成 PDF
              </button>
              <a
                href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(`Cheersin ${courseName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCertificateShare('linkedin')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-medium games-focus-ring"
              >
                <Share2 className="w-5 h-5" />
                分享至 LinkedIn
              </a>
              <a
                href={shareUrl ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCertificateShare('line')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34a] text-white font-medium games-focus-ring"
              >
                分享至 LINE
              </a>
              <Link href="/learn" className="btn-secondary min-h-[48px] inline-flex items-center justify-center gap-2 games-focus-ring rounded">
                繼續學習
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button
                type="button"
                disabled
                className="text-white/40 text-xs px-4 py-2 rounded-lg border border-white/20 cursor-not-allowed"
                title="即將推出"
              >
                NFT 證書（即將推出）
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
