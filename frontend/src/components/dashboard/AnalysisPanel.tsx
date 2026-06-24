import { SkeletonText } from '@/components/ui/Skeleton'
import type { AnalysisStatus } from '@/types'

interface AnalysisPanelProps {
  text: string
  status: AnalysisStatus
}

const STATUS_LABELS: Partial<Record<AnalysisStatus, string>> = {
  fetching_github: '> fetching github data...',
  processing: '> computing developer scores...',
  streaming_analysis: '> running ai analysis...',
}

export default function AnalysisPanel({ text, status }: AnalysisPanelProps) {
  const isStreaming = status === 'streaming_analysis'
  const isLoading = status === 'fetching_github' || status === 'processing'
  const isComplete = status === 'complete'

  return (
    <div className="border border-term-border bg-term-pane">
      {/* Title bar */}
      <div className="bg-[#081408] border-b border-term-border px-4 py-1.5 text-xs flex items-center justify-between">
        <div>
          <span className="text-term-muted">┌─[</span>
          <span className="text-term-green tracking-widest font-bold ml-1">AI ANALYSIS</span>
          <span className="text-term-muted">]</span>
        </div>

        {/* Status indicator */}
        {(isStreaming || isLoading) && (
          <div className="flex items-center gap-2 text-term-amber text-xs font-mono">
            <span className="h-1.5 w-1.5 bg-term-amber animate-pulse inline-block" />
            {STATUS_LABELS[status]}
          </div>
        )}
        {isComplete && (
          <div className="flex items-center gap-1.5 text-term-green text-xs font-mono">
            <span>[OK]</span>
            <span className="text-term-dim">COMPLETE</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {/* Command line */}
        <p className="text-term-muted text-xs font-mono mb-4">
          $ gitpulse analyze --stream
        </p>

        {/* Loading skeleton */}
        {isLoading && !text && (
          <div className="space-y-2">
            <p className="text-term-dim text-xs font-mono animate-pulse">{'> [WAIT] initializing analysis...'}</p>
            <SkeletonText lines={6} />
          </div>
        )}

        {/* Analysis text */}
        {text ? (
          <div
            className="analysis-prose text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatAnalysisText(text) }}
          />
        ) : null}

        {/* Streaming cursor */}
        {isStreaming && (
          <span className="inline-block text-term-green animate-blink text-sm">█</span>
        )}
      </div>
    </div>
  )
}

/**
 * Minimal markdown-to-HTML for the streamed analysis text.
 * TODO (Claude Code): replace with a proper markdown parser (e.g. marked, markdown-it)
 * if Claude returns richer formatting. This handles the common cases.
 */
function formatAnalysisText(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
}
