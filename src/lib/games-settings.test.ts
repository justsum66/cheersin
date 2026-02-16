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
      setFontSize('small')
      expect(getFontSize()).toBe('small')
      setFontSize('large')
      expect(getFontSize()).toBe('large')
      setFontSize('medium')
      expect(getFontSize()).toBe('medium')
    })

    it('getFontSize returns medium for invalid stored value', () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('cheersin_games_font_size', 'xxl')
      expect(getFontSize()).toBe('medium')
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
