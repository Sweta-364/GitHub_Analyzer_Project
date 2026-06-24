import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  title?: string
}

export default function Card({
  className,
  variant = 'default',
  padding = 'md',
  title,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'border border-term-border bg-term-pane',
        className
      )}
      {...props}
    >
      {title && (
        <div className="bg-[#081408] border-b border-term-border px-4 py-1.5 text-xs">
          <span className="text-term-muted">┌─[</span>
          <span className="text-term-green tracking-widest font-bold ml-1">{title}</span>
          <span className="text-term-muted">]</span>
        </div>
      )}
      <div
        className={cn({
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-5': padding === 'md',
          'p-6': padding === 'lg',
        })}
      >
        {children}
      </div>
    </div>
  )
}
