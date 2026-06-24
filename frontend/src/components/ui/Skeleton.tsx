import { cn } from '@/utils/helpers'

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'skeleton opacity-40 h-3',
        className
      )}
    />
  )
}

export function SkeletonText({ lines = 3, className }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('border border-term-border bg-term-pane p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

const BOOT_STEPS = [
  '> CONNECTING TO GITHUB API...',
  '> FETCHING REPOSITORY DATA...',
  '> COMPUTING DEVELOPER SCORES...',
]

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in border border-term-border bg-term-pane p-6">
      <div className="text-term-muted text-xs font-mono mb-2">
        $ gitpulse analyze --loading
      </div>

      {BOOT_STEPS.map((step, i) => (
        <div key={i} className="flex items-center justify-between font-mono text-xs">
          <span className="text-term-dim">{step}</span>
          <span className="text-term-green animate-pulse ml-4">
            {'[' + '·'.repeat(8) + ']'}
          </span>
        </div>
      ))}

      <div className="pt-4 space-y-3 border-t border-term-border mt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
