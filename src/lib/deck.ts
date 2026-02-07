/**
 * 撲克牌工具：52 張牌、洗牌、發牌（供十三張、21 點等使用）
 */

export type Suit = 's' | 'h' | 'd' | 'c'
export type Card = { suit: Suit; rank: number }

const SUITS: Suit[] = ['s', 'h', 'd', 'c']
const RANK_NAMES: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const out = [...deck]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 牌面顯示用（A/J/Q/K） */
export function rankLabel(rank: number): string {
  return RANK_NAMES[rank] ?? String(rank)
}

/** 花色符號 */
export function suitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
  return symbols[suit]
}

/** 21 點用：A 可 1 或 11，J/Q/K=10 */
export function blackjackValue(cards: Card[]): number {
  let sum = 0
  let aces = 0
  for (const c of cards) {
    if (c.rank === 1) aces++
    else if (c.rank >= 11) sum += 10
    else sum += c.rank
  }
  sum += aces
  while (aces > 0 && sum + 10 <= 21) {
    sum += 10
    aces--
  }
  return sum
}

/** 十三張用：單張點數 A=14, K=13, ..., 2=2 */
export function rowPoint(rank: number): number {
  return rank === 1 ? 14 : rank
}
