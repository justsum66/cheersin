'use client'

import * as React from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
    trigger: React.ReactNode
    children: React.ReactNode
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    align?: 'start' | 'end' | 'center'
    className?: string
}

export function DropdownMenu({ trigger, children, isOpen, onOpenChange, align = 'end', className }: DropdownMenuProps) {
    const menuRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onOpenChange(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onOpenChange])

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <div onClick={() => onOpenChange(!isOpen)}>
                {trigger}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "absolute z-50 mt-2 min-w-[12rem] origin-top-right rounded-xl border border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl p-1 shadow-xl focus:outline-none",
                            align === 'end' && "right-0",
                            align === 'start' && "left-0",
                            align === 'center' && "left-1/2 -translate-x-1/2",
                            className
                        )}
                    >
                        {children}
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function DropdownItem({ children, onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
