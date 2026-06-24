import { formatNumber, timeAgo } from '@/utils/helpers'
import type { RepoSummary } from '@/types'

interface TopReposProps {
  repos: RepoSummary[]
}

export default function TopRepos({ repos }: TopReposProps) {
  return (
    <div className="border border-term-border bg-term-pane">
      {/* Title bar */}
      <div className="bg-[#081408] border-b border-term-border px-4 py-1.5 text-xs">
        <span className="text-term-muted">┌─[</span>
        <span className="text-term-green tracking-widest font-bold ml-1">TOP REPOSITORIES</span>
        <span className="text-term-muted">]</span>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-term-muted text-xs mb-4 font-mono">
          $ ls --sort=stars ./repos/
        </p>

        <div className="font-mono">
          {repos.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2 border-b border-term-border last:border-0 hover:bg-[#0d2b0d] group transition-colors"
            >
              {/* Prefix */}
              <span className="text-term-muted text-xs flex-shrink-0 select-none">&gt;</span>

              {/* Repo name */}
              <span className="text-term-green text-sm flex-1 min-w-0 truncate group-hover:glow-sm transition-all">
                {repo.name}
              </span>

              {/* Language badge */}
              {repo.language && (
                <span className="text-term-amber text-xs flex-shrink-0 hidden sm:inline">
                  [{repo.language.slice(0, 4).toUpperCase()}]
                </span>
              )}

              {/* Stars */}
              <span className="text-term-dim text-xs flex-shrink-0">
                ★ {formatNumber(repo.stars)}
              </span>

              {/* Time */}
              <span className="text-term-muted text-xs flex-shrink-0 hidden md:inline">
                {timeAgo(repo.last_push)}
              </span>

              {/* Arrow on hover */}
              <span className="text-term-green text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                ↗
              </span>
            </a>
          ))}

          {repos.length === 0 && (
            <p className="text-term-muted text-xs">{'> no repositories found'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
