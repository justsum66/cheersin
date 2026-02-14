'use client'

/**
 * R2-118：iOS 風格慣性滾輪 Picker
 * 觸控滑動後依速度慣性滾動並減速停止，選中項 snap to center
 */
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const ITEM_HEIGHT = 44
const VISIBLE_ITEMS = 5
const MOMENTUM_DECAY = 0.92
const SNAP_THRESHOLD = 2
const MIN_VELOCITY = 0.5

export interface InertialPickerProps<T = string> {
  /** 選項列表 */
  items: T[]
  /** 選中索引（受控） */
  value: number
  /** 選中變更回調 */
  onChange: (index: number) => void
  /** 渲染單項 */
  renderItem?: (item: T, index: number, selected: boolean) => React.ReactNode
  /** 取得顯示文字（預設 String） */
  getLabel?: (item: T) => string
  /** 無障礙標籤 */
  'aria-label'?: string
  /** 額外 className */
  className?: string
}

export function InertialPicker<T = string>({
  items,
  value,
  onChange,
  renderItem,
  getLabel = (x) => String(x),
  'aria-label': ariaLabel = '選擇',
  className = '',
}: InertialPickerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(0)
  const lastYRef = useRef(0)
  const lastTimeRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const isTouchingRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  const [dragging, setDragging] = useState(false)

  /** 計算可滾動範圍：offset 0 = 第一項置中 */
  const maxOffset = 0
  const minOffset = -Math.max(0, items.length - 1) * ITEM_HEIGHT

  const snapToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, items.length - 1))
      onChange(clamped)
      offsetRef.current = -clamped * ITEM_HEIGHT
    },
    [items.length, onChange]
  )

  const animate = useCallback(() => {
    if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
      velocityRef.current = 0
      const closest = Math.round(-offsetRef.current / ITEM_HEIGHT)
      snapToIndex(closest)
      rafRef.current = null
      return
    }
    offsetRef.current += velocityRef.current
    velocityRef.current *= MOMENTUM_DECAY
    if (offsetRef.current > maxOffset) {
      offsetRef.current = maxOffset
      velocityRef.current = 0
    }
    if (offsetRef.current < minOffset) {
      offsetRef.current = minOffset
      velocityRef.current = 0
    }
    if (listRef.current) {
      listRef.current.style.transform = `translateY(${offsetRef.current}px)`
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [maxOffset, minOffset, snapToIndex])

  const stopMomentum = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent) => {
      if (reducedMotion) return
      isTouchingRef.current = true
      stopMomentum()
      lastYRef.current = e.touches[0]?.clientY ?? 0
      lastTimeRef.current = Date.now()
      velocityRef.current = 0
      setDragging(true)
    },
    [reducedMotion, stopMomentum]
  )

  const handleTouchMove = useCallback(
    (e: ReactTouchEvent) => {
      if (!isTouchingRef.current || reducedMotion) return
      e.preventDefault()
      const y = e.touches[0]?.clientY ?? 0
      const now = Date.now()
      const dt = Math.max(1, now - lastTimeRef.current)
      const dy = y - lastYRef.current
      velocityRef.current = dy / dt
      offsetRef.current += dy
      offsetRef.current = Math.max(minOffset, Math.min(maxOffset, offsetRef.current))
      lastYRef.current = y
      lastTimeRef.current = now
      if (listRef.current) {
        listRef.current.style.transform = `translateY(${offsetRef.current}px)`
      }
    },
    [minOffset, maxOffset, reducedMotion]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isTouchingRef.current) return
    isTouchingRef.current = false
    setDragging(false)
    if (reducedMotion) {
      snapToIndex(Math.round(-offsetRef.current / ITEM_HEIGHT))
      return
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
  }, [reducedMotion, snapToIndex, animate])

  const handleWheel = useCallback(
    (e: ReactWheelEvent) => {
      if (reducedMotion) return
      e.preventDefault()
      stopMomentum()
      const dy = e.deltaY
      offsetRef.current += dy
      offsetRef.current = Math.max(minOffset, Math.min(maxOffset, offsetRef.current))
      velocityRef.current = dy * 0.3
      if (listRef.current) {
        listRef.current.style.transform = `translateY(${offsetRef.current}px)`
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animate)
    },
    [minOffset, maxOffset, reducedMotion, stopMomentum, animate]
  )

  /** 初始化 offset 對齊 value，同步 DOM transform */
  useEffect(() => {
    offsetRef.current = -value * ITEM_HEIGHT
    if (listRef.current) {
      listRef.current.style.transform = `translateY(${offsetRef.current}px)`
    }
  }, [value])

  useEffect(() => {
    return () => stopMomentum()
  }, [stopMomentum])

  if (items.length === 0) return null

  const padding = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT
  const initialOffset = -value * ITEM_HEIGHT

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        height: VISIBLE_ITEMS * ITEM_HEIGHT,
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={items[value] ? `inertial-picker-${value}` : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (reducedMotion) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault()
            onChange(Math.min(value + 1, items.length - 1))
          }
          if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault()
            onChange(Math.max(value - 1, 0))
          }
        }
      }}
    >
      <div
        className="absolute left-0 right-0 h-[44px] pointer-events-none border-y border-white/20 bg-white/5 rounded"
        style={{ top: padding, left: 4, right: 4 }}
        aria-hidden
      />
      <div
        ref={listRef}
        className="relative transition-transform duration-0 will-change-transform"
        style={{
          paddingTop: padding,
          paddingBottom: padding,
          transform: `translateY(${initialOffset}px)`,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            id={`inertial-picker-${i}`}
            role="option"
            aria-selected={value === i}
            className={`flex items-center justify-center text-center cursor-default transition-colors ${
              value === i && !dragging ? 'text-white font-semibold text-lg' : 'text-white/60 text-base'
            }`}
            style={{ height: ITEM_HEIGHT, minHeight: ITEM_HEIGHT }}
            onClick={() => {
              if (reducedMotion) {
                onChange(i)
              } else {
                snapToIndex(i)
              }
            }}
          >
            {renderItem ? renderItem(item, i, value === i) : getLabel(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
