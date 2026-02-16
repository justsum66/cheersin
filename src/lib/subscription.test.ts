import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getMaxAICallsPerDay,
  getMaxRoomPlayers,
  canAccessProCourse,
  canUseAICall,
  canUseProTrial,
  getProTrialRemainingThisMonth,
  type SubscriptionTier,
} from './subscription'

describe('subscription tier helpers', () => {
  it('getMaxAICallsPerDay free is 3', () => {
    expect(getMaxAICallsPerDay('free')).toBe(3)
  })
  it('getMaxAICallsPerDay premium is -1', () => {
    expect(getMaxAICallsPerDay('premium')).toBe(-1)
  })
  it('getMaxRoomPlayers free is 2', () => {
    expect(getMaxRoomPlayers('free')).toBe(2)
  })
  it('getMaxRoomPlayers premium is 12', () => {
    expect(getMaxRoomPlayers('premium')).toBe(12)
  })
  it('canAccessProCourse free is false', () => {
    expect(canAccessProCourse('free')).toBe(false)
  })
  it('canAccessProCourse premium is true', () => {
    expect(canAccessProCourse('premium')).toBe(true)
  })
  it('canUseAICall free with 2 used returns true', () => {
    expect(canUseAICall('free', 2)).toBe(true)
  })
  it('canUseAICall free with 3 used returns false', () => {
    expect(canUseAICall('free', 3)).toBe(false)
  })
  it('canUseAICall premium with any used returns true', () => {
    expect(canUseAICall('premium', 100)).toBe(true)
  })
})

describe('canUseProTrial', () => {
  it('basic tier always returns true', () => {
    expect(canUseProTrial('basic')).toBe(true)
  })
  it('premium tier always returns true', () => {
    expect(canUseProTrial('premium')).toBe(true)
  })
})

describe('getProTrialRemainingThisMonth', () => {
  it('non-free returns -1', () => {
    expect(getProTrialRemainingThisMonth('basic')).toBe(-1)
    expect(getProTrialRemainingThisMonth('premium')).toBe(-1)
  })
})
