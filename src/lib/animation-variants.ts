/**
 * CLEAN-018: Unified Animation Variants Library.
 * Single source of truth for all Framer Motion variants used across the app.
 * Merges src/lib/animations.ts (raw objects) and src/lib/variants.ts (typed Variants).
 *
 * Usage:
 *   import { fadeIn, slideUp, staggerContainer, modalContent } from '@/lib/animation-variants'
 */

import type { Variants, Transition } from 'framer-motion'

// ── Reduced-motion safe defaults ──
const REDUCED_MOTION_TRANSITION: Transition = { duration: 0.01 }

export function rmSafe(variants: Variants): Variants {
  const safe: Variants = {}
  for (const key of Object.keys(variants)) {
    const v = variants[key]
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      safe[key] = { ...v, transition: REDUCED_MOTION_TRANSITION }
    } else {
      safe[key] = v
    }
  }
  return safe
}

// ── Page & section reveals ──
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8 },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: 8 },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20 },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98 },
}

// ── Stagger containers ──
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0 },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

// ── Modal variants ──
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

// ── Interactive gestures (not Variants, but motion props) ──
export const buttonHover = { scale: 1.05, transition: { duration: 0.2 } }
export const buttonTap = { scale: 0.95, transition: { duration: 0.1 } }
export const cardHover = {
  y: -5,
  scale: 1.02,
  transition: { duration: 0.3, type: 'spring' as const, stiffness: 300 },
}
export const cardHover3D = {
  scale: 1.03,
  rotateX: 2,
  rotateY: -2,
  z: 15,
  transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] as const },
}
