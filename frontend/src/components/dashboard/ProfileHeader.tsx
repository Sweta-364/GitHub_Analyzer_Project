import { formatNumber } from '@/utils/helpers'
import type { GitHubUser } from '@/types'

interface ProfileHeaderProps {
  user: GitHubUser
  totalCommits90d: number
  longestStreak: number
  currentStreak: number
}

function pad(label: string, width: number): string {
  return label + '.'.repeat(Math.max(0, width - label.length))
}

export default function ProfileHeader({
  user,
  totalCommits90d,
  longestStreak,
  currentStreak,
}: ProfileHeaderProps) {
  const joinYear = new Date(user.created_at).getFullYear()

  return (
    <div className="border border-term-border bg-term-pane p-5">
      {/* Header command */}
      <div className="text-term-muted text-xs mb-3">$ whoami</div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Avatar */}
        <img
          src={user.avatar_url}
          alt={user.login}
          className="h-16 w-16 flex-shrink-0 border border-term-border grayscale opacity-80"
        />

        {/* Main info block */}
        <div className="flex-1 min-w-0 font-mono">
          {/* Name + handle */}
          <div className="mb-3">
            <p className="text-term-green font-bold text-lg glow leading-tight">
              &gt; {(user.name ?? user.login).toUpperCase()}{' '}
              <span className="text-term-dim text-sm font-normal">@{user.login}</span>
            </p>
          </div>

          {/* Info fields */}
          <div className="space-y-0.5 text-xs mb-3">
            {user.name && (
              <p className="text-term-dim">
                <span className="text-term-muted">{pad('  NAME', 14)}:</span>{' '}
                <span className="text-term-green">{user.name}</span>
              </p>
            )}
            {user.company && (
              <p className="text-term-dim">
                <span className="text-term-muted">{pad('  COMPANY', 14)}:</span>{' '}
                <span className="text-term-green">{user.company}</span>
              </p>
            )}
            {user.location && (
              <p className="text-term-dim">
                <span className="text-term-muted">{pad('  LOCATION', 14)}:</span>{' '}
                <span className="text-term-green">{user.location}</span>
              </p>
            )}
            <p className="text-term-dim">
              <span className="text-term-muted">{pad('  JOINED', 14)}:</span>{' '}
              <span className="text-term-green">{joinYear}</span>
            </p>
          </div>

          {/* Divider */}
          <div className="text-term-border text-xs mb-3 select-none">
            {'─'.repeat(52)}
          </div>

          {/* Stats row */}
          <div className="text-xs space-y-0.5">
            <p className="text-term-dim">
              <span className="text-term-muted">{pad('  FOLLOWERS', 14)}:</span>{' '}
              <span className="text-term-green">{formatNumber(user.followers)}</span>
              <span className="text-term-muted ml-4">{pad('REPOS', 8)}:</span>{' '}
              <span className="text-term-green">{user.public_repos}</span>
              <span className="text-term-muted ml-4">{pad('COMMITS(90d)', 12)}:</span>{' '}
              <span className="text-term-green">{totalCommits90d}</span>
            </p>
            <p className="text-term-dim">
              <span className="text-term-muted">{pad('  STREAK', 14)}:</span>{' '}
              <span className="text-term-green">{currentStreak} days current</span>
              <span className="text-term-muted ml-3">|  LONGEST:</span>{' '}
              <span className="text-term-green">{longestStreak} days</span>
            </p>
          </div>
        </div>

        {/* GitHub link */}
        <div className="flex-shrink-0">
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-term-border text-term-dim hover:border-term-green hover:text-term-green transition-all"
          >
            <span className="opacity-60">[</span>
            VIEW ON GITHUB ↗
            <span className="opacity-60">]</span>
          </a>
        </div>
      </div>
    </div>
  )
}
