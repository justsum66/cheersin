/**
 * 願望清單 React Hook
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist,
  type WishlistItem
} from '@/lib/wishlist'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初始化載入
  useEffect(() => {
    setWishlist(getWishlist())
    setIsLoading(false)
  }, [])

  // 新增到願望清單
  const add = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    const success = addToWishlist(item)
    if (success) {
      setWishlist(getWishlist())
    }
    return success
  }, [])

  // 從願望清單移除
  const remove = useCallback((id: string) => {
    const success = removeFromWishlist(id)
    if (success) {
      setWishlist(getWishlist())
    }
    return success
  }, [])

  // 切換願望清單狀態
  const toggle = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    if (isInWishlist(item.id)) {
      remove(item.id)
      return false
    } else {
      add(item)
      return true
    }
  }, [add, remove])

  // 檢查是否在願望清單中
  const contains = useCallback((id: string) => {
    return isInWishlist(id)
  }, [])

  // 清空願望清單
  const clear = useCallback(() => {
    clearWishlist()
    setWishlist([])
  }, [])

  return {
    wishlist,
    isLoading,
    add,
    remove,
    toggle,
    contains,
    clear,
    count: wishlist.length
  }
}
