'use client'

/** P1-092：響應式表格 — 小屏堆疊或水平滾動，確保可讀 */
import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  /** 小屏隱藏 */
  hideOnMobile?: boolean
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  className?: string
  /** 小屏改為卡片堆疊 */
  responsiveStack?: boolean
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className = '',
  responsiveStack = true,
}: TableProps<T>) {
  if (data.length === 0) return null

  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* 桌面：表格 */}
      <table className="w-full border-collapse text-left hidden md:table">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th key={col.key} className="py-3 px-4 text-white/70 font-medium text-sm">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-white/5 hover:bg-white/5">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-white/90 text-sm">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* 小屏：卡片堆疊 */}
      {responsiveStack && (
        <div className="md:hidden space-y-3">
          {data.map((row) => (
            <div
              key={keyExtractor(row)}
              className="rounded-xl border border-white/10 p-4 space-y-2 bg-white/[0.03]"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between gap-2">
                  <span className="text-white/50 text-sm shrink-0">{col.header}</span>
                  <span className="text-white/90 text-sm text-right min-w-0">{col.render(row)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
