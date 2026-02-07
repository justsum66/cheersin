'use client'

/** P1-075：密碼強度指示器 — 註冊/修改密碼時即時顯示 */
import { useMemo } from 'react'

export interface PasswordStrengthProps {
  password: string
  className?: string
}

function getStrength(pwd: string): { level: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!pwd.length) return { level: 0, label: '', color: 'bg-white/20' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  const level = Math.min(4, Math.floor(score / 1.2)) as 0 | 1 | 2 | 3 | 4
  const labels = ['弱', '一般', '中等', '強', '很強']
  const colors = ['bg-error', 'bg-warning', 'bg-secondary-500', 'bg-primary-500', 'bg-success']
  return { level, label: labels[level], color: colors[level] }
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const { level, label, color } = useMemo(() => getStrength(password), [password])

  if (!password) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-white/10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 transition-colors duration-200 ${i <= level ? color : 'bg-transparent'}`}
            aria-hidden
          />
        ))}
      </div>
      <span className="text-xs text-white/60 tabular-nums">{label}</span>
    </div>
  )
}
