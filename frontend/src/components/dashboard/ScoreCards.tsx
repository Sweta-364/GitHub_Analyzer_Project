import { scoreLabel } from '@/utils/helpers'
import type { DeveloperScores } from '@/types'

interface ScoreCardsProps {
  scores: DeveloperScores
}

const SCORE_META = [
  {
    key: 'language_diversity_score' as const,
    label: 'LANG_DIVERSITY',
    icon: '🌐',
  },
  {
    key: 'commit_consistency_score' as const,
    label: 'COMMIT_CONSIS',
    icon: '📅',
  },
  {
    key: 'project_depth_score' as const,
    label: 'PROJECT_DEPTH',
    icon: '🏗',
  },
  {
    key: 'collaboration_index' as const,
    label: 'COLLABORATION',
    icon: '🤝',
  },
  {
    key: 'activity_recency_score' as const,
    label: 'ACTIVITY_RECEN',
    icon: '⚡',
  },
]

function TermBar({ score, barWidth = 20 }: { score: number; barWidth?: number }) {
  const filled = Math.round((score / 10) * barWidth)
  const empty = barWidth - filled
  const colorClass =
    score >= 8 ? 'text-term-green' :
    score >= 6 ? 'text-term-amber' :
    score >= 4 ? 'text-yellow-600' : 'text-term-red'

  return (
    <span className="font-mono text-xs">
      <span className={colorClass}>{'█'.repeat(Math.max(0, filled))}</span>
      <span className="text-term-border">{'░'.repeat(Math.max(0, empty))}</span>
    </span>
  )
}

function scoreNumColor(score: number): string {
  if (score >= 8) return 'text-term-green'
  if (score >= 6) return 'text-term-amber'
  if (score >= 4) return 'text-yellow-600'
  return 'text-term-red'
}

export default function ScoreCards({ scores }: ScoreCardsProps) {
  return (
    <div className="border border-term-border bg-term-pane">
      {/* Title bar */}
      <div className="bg-[#081408] border-b border-term-border px-4 py-1.5 text-xs">
        <span className="text-term-muted">┌─[</span>
        <span className="text-term-green tracking-widest font-bold ml-1">DEVELOPER SCORES</span>
        <span className="text-term-muted">]</span>
      </div>

      <div className="p-5">
        {/* Overall score */}
        <div className="mb-4 flex items-baseline gap-3">
          <span className="text-term-muted text-xs">OVERALL:</span>
          <span className={`text-2xl font-bold glow ${scoreNumColor(scores.overall_score)}`}>
            {scores.overall_score.toFixed(1)}/10
          </span>
          <span className="text-term-dim text-xs uppercase tracking-wider">
            [{scoreLabel(scores.overall_score).toUpperCase()}]
          </span>
        </div>

        {/* Divider */}
        <div className="text-term-border text-xs mb-4 select-none">
          {'─'.repeat(50)}
        </div>

        {/* Score rows */}
        <div className="space-y-2">
          {SCORE_META.map(({ key, label, icon }) => {
            const score = scores[key]
            return (
              <div key={key} className="flex items-center gap-3 text-xs font-mono">
                <span className="text-term-dim uppercase tracking-wider min-w-[150px] sm:min-w-[160px] truncate">
                  {label}
                </span>
                {/* Full-width bar on sm+, reduced on mobile */}
                <span className="hidden sm:inline">
                  <TermBar score={score} barWidth={20} />
                </span>
                <span className="sm:hidden">
                  <TermBar score={score} barWidth={12} />
                </span>
                <span className={`min-w-[36px] text-right font-bold ${scoreNumColor(score)}`}>
                  {score.toFixed(1)}
                </span>
                <span className="text-sm leading-none">{icon}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
