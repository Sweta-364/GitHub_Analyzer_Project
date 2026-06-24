import { clsx, type ClassValue } from 'clsx'

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Format large numbers: 12345 → "12.3k" */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/** Score 0–10 → color class */
export function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 6) return 'text-brand-400'
  if (score >= 4) return 'text-amber-400'
  return 'text-rose-400'
}

/** Score 0–10 → label */
export function scoreLabel(score: number): string {
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Developing'
  return 'Needs Work'
}

/** ISO date string → "Jan 2024" */
export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** ISO date string → relative time: "3 days ago" */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const intervals = [
    { label: 'year', secs: 31_536_000 },
    { label: 'month', secs: 2_592_000 },
    { label: 'day', secs: 86_400 },
    { label: 'hour', secs: 3_600 },
    { label: 'minute', secs: 60 },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
