/**
 * 遊戲設定單元測試：字級、減少動畫、傳手機選項（jsdom localStorage）
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFontSize,
  setFontSize,
  getReduceMotion,
  setReduceMotion,
  getPassPhoneEnabled,
  setPassPhoneEnabled,
  type FontSize,
} from './games-settings'

describe('games-settings', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('getFontSize / setFontSize', () => {
    it('getFontSize returns md by default', () => {
      expect(getFontSize()).toBe('md')
    })

    it('setFontSize and getFontSize round-trip', () => {
      setFontSize('sm')
      expect(getFontSize()).toBe('sm')
      setFontSize('lg')
      expect(getFontSize()).toBe('lg')
      setFontSize('md')
      expect(getFontSize()).toBe('md')
    })

    it('getFontSize returns md for invalid stored value', () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('cheersin-games-font-size', 'xxl')
      expect(getFontSize()).toBe('md')
    })
  })

  describe('getReduceMotion / setReduceMotion', () => {
    it('getReduceMotion returns false by default', () => {
      expect(getReduceMotion()).toBe(false)
    })

    it('setReduceMotion true and get round-trip', () => {
      setReduceMotion(true)
      expect(getReduceMotion()).toBe(true)
      setReduceMotion(false)
      expect(getReduceMotion()).toBe(false)
    })
  })

  describe('getPassPhoneEnabled / setPassPhoneEnabled', () => {
    it('getPassPhoneEnabled returns false by default', () => {
      expect(getPassPhoneEnabled()).toBe(false)
    })

    it('setPassPhoneEnabled and get round-trip', () => {
      setPassPhoneEnabled(true)
      expect(getPassPhoneEnabled()).toBe(true)
      setPassPhoneEnabled(false)
      expect(getPassPhoneEnabled()).toBe(false)
    })
  })
})
