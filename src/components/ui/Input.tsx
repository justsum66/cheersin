'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, id, error, placeholder, ...props }, ref) => {
        const generatedId = React.useId()
        const inputId = id || generatedId

        return (
            <div className="relative group">
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 peer pt-4",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    ref={ref}
                    id={inputId}
                    placeholder={placeholder || " "}
                    {...props}
                />
                <label
                    htmlFor={inputId}
                    className={cn(
                        "absolute left-3 top-1 text-xs text-white/50 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/50 peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary-400 pointer-events-none",
                        error && "text-red-400 peer-focus:text-red-400"
                    )}
                >
                    {label}
                </label>
                {error && <span className="text-xs text-red-400 mt-1 ml-1">{error}</span>}
            </div>
        )
    }
)
Input.displayName = 'Input'
