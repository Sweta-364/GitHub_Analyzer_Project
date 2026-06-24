import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/helpers'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-mono font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-term-green disabled:pointer-events-none disabled:opacity-40 tracking-wide',
          {
            // variants
            'border border-term-green text-term-green bg-transparent hover:bg-term-green hover:text-black':
              variant === 'primary',
            'border border-term-border text-term-dim hover:border-term-green hover:text-term-green':
              variant === 'secondary',
            'text-term-muted hover:text-term-green bg-transparent border-0':
              variant === 'ghost',
            'border border-term-red text-term-red bg-transparent hover:bg-term-red hover:text-black':
              variant === 'danger',
            // sizes
            'h-7 px-3 text-xs': size === 'sm',
            'h-9 px-4 text-sm': size === 'md',
            'h-11 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="animate-blink">{'> ...'}</span>
        ) : (
          <>
            <span className="opacity-60">[</span>
            <span>{children}</span>
            <span className="opacity-60">]</span>
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
