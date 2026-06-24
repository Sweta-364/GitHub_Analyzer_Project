import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/helpers'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
}

export default function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 font-mono border',
        {
          'text-term-muted border-term-border': variant === 'default',
          'text-term-green border-term-border': variant === 'success',
          'text-term-amber border-term-amber-dim': variant === 'warning',
          'text-term-red border-term-red': variant === 'danger',
          'text-[#00ccff] border-[#006688]': variant === 'info',
          'text-term-dim border-term-border': variant === 'purple',
        },
        className
      )}
      {...props}
    >
      <span className="opacity-60">[</span>
      {children}
      <span className="opacity-60">]</span>
    </span>
  )
}
