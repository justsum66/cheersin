'use client'

import * as React from 'react'
import { m, useMotionValue, useTransform } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    label?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ checked, onCheckedChange, label, className, disabled, ...props }, ref) => {

        return (
            <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none group", disabled && "cursor-not-allowed opacity-50", className)}>
                <div className="relative flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={checked}
                        onChange={(e) => onCheckedChange(e.target.checked)}
                        disabled={disabled}
                        ref={ref}
                        {...props}
                    />
                    <m.div
                        className={cn(
                            "h-5 w-5 rounded border border-white/30 bg-white/10 transition-colors group-hover:bg-white/20 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500",
                            checked && "border-primary-500 bg-primary-500 group-hover:bg-primary-600"
                        )}
                        initial={false}
                        animate={checked ? { scale: [1, 0.8, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <m.div
                            initial={false}
                            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                        </m.div>
                    </m.div>
                </div>
                {label && <span className="text-sm text-white/90 group-hover:text-white transition-colors">{label}</span>}
            </label>
        )
    }
)
Checkbox.displayName = "Checkbox"
