/**
 * 願望清單：localStorage 持久化酒款收藏
 */

export interface WishlistItem {
  id: string
  name: string
  type?: string
  region?: string
  price?: string
  imageUrl?: string
  addedAt: number
}

const WISHLIST_KEY = 'cheersin_wishlist'
const MAX_WISHLIST_ITEMS = 100

/**
 * 取得願望清單
 */
export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WishlistItem[]
    return Array.isArray(parsed) ? parsed.slice(-MAX_WISHLIST_ITEMS) : []
  } catch {
    return []
  }
}

/**
 * 新增到願望清單
 */
export function addToWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
  if (typeof window === 'undefined') return false
  try {
    const list = getWishlist()
    // 檢查是否已存在
    if (list.some((w) => w.id === item.id)) return false
    
    const newList = [
      ...list,
      { ...item, addedAt: Date.now() }
    ].slice(-MAX_WISHLIST_ITEMS)
    
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(newList))
    return true
  } catch {
    return false
  }
}

/**
 * 從願望清單移除
 */
export function removeFromWishlist(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const list = getWishlist()
    const newList = list.filter((w) => w.id !== id)
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(newList))
    return true
  } catch {
    return false
  }
}

/**
 * 檢查是否在願望清單中
 */
export function isInWishlist(id: string): boolean {
  return getWishlist().some((w) => w.id === id)
}

/**
 * 清空願望清單
 */
export function clearWishlist(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(WISHLIST_KEY)
  } catch {}
}
