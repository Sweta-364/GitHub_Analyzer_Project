import type { LanguageStat } from '@/types'

interface LanguageChartProps {
  languages: LanguageStat[]
}

const BAR_WIDTH = 30

export default function LanguageChart({ languages }: LanguageChartProps) {
  const top = languages.slice(0, 8)
  const maxPct = top.length > 0 ? top[0].percentage : 100

  return (
    <div className="border border-term-border bg-term-pane">
      {/* Title bar */}
      <div className="bg-[#081408] border-b border-term-border px-4 py-1.5 text-xs">
        <span className="text-term-muted">┌─[</span>
        <span className="text-term-green tracking-widest font-bold ml-1">LANGUAGE DISTRIBUTION</span>
        <span className="text-term-muted">]</span>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-term-muted text-xs mb-4">
          $ cat languages.json | sort -rk2
        </p>

        <div className="space-y-2 font-mono">
          {top.map((lang) => {
            const filled = Math.round((lang.percentage / maxPct) * BAR_WIDTH)
            const empty = BAR_WIDTH - filled
            const isMajor = lang.percentage > 50

            return (
              <div key={lang.name} className="flex items-center gap-3 text-xs">
                {/* Language name */}
                <span className="text-term-dim min-w-[90px] sm:min-w-[100px] truncate">
                  {lang.name}
                </span>

                {/* Bar */}
                <span className="font-mono hidden sm:inline">
                  <span className={isMajor ? 'text-term-green' : 'text-term-dim'}>
                    {'█'.repeat(Math.max(0, filled))}
                  </span>
                  <span className="text-term-border">
                    {'░'.repeat(Math.max(0, empty))}
                  </span>
                </span>

                {/* Mobile shorter bar */}
                <span className="font-mono sm:hidden">
                  <span className={isMajor ? 'text-term-green' : 'text-term-dim'}>
                    {'█'.repeat(Math.max(0, Math.round(filled * 0.5)))}
                  </span>
                  <span className="text-term-border">
                    {'░'.repeat(Math.max(0, Math.round(empty * 0.5)))}
                  </span>
                </span>

                {/* Percentage */}
                <span className="text-term-muted min-w-[48px] text-right">
                  {lang.percentage.toFixed(1)}%
                </span>
              </div>
            )
          })}

          {top.length === 0 && (
            <p className="text-term-muted text-xs">{'> no language data available'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
