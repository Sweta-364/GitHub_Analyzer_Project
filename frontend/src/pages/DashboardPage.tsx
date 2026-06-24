import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAnalysisStore } from '@/store/analysisStore'
import { useAnalysis } from '@/hooks/useAnalysis'
import Navbar from '@/components/ui/Navbar'
import ProfileHeader from '@/components/dashboard/ProfileHeader'
import ScoreCards from '@/components/dashboard/ScoreCards'
import LanguageChart from '@/components/dashboard/LanguageChart'
import ActivityChart from '@/components/dashboard/ActivityChart'
import TopRepos from '@/components/dashboard/TopRepos'
import AnalysisPanel from '@/components/dashboard/AnalysisPanel'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  const { username } = useParams<{ username: string }>()
  const { status, githubData, analysisText, error, cached } = useAnalysisStore()
  const { startAnalysis } = useAnalysis()

  // If navigated directly to /analyze/:username without going through the search,
  // kick off the analysis automatically.
  useEffect(() => {
    if (username && status === 'idle') {
      startAnalysis(username)
    }
  }, [username, status, startAnalysis])

  const isLoading = status === 'fetching_github' || status === 'processing'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error state */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in border border-term-border bg-term-pane p-8">
            <p className="text-term-red text-sm font-mono mb-2">[ERR] Something went wrong</p>
            <p className="text-term-dim text-xs font-mono mb-6 max-w-sm">
              {error ?? 'Unable to load analysis. Please try again.'}
            </p>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => username && startAnalysis(username, true)}>
                Try again
              </Button>
              <Link to="/">
                <Button variant="secondary">Back to search</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && !githubData && <DashboardSkeleton />}

        {/* Dashboard — shown once we have GitHub data (even while Claude streams) */}
        {githubData && (
          <div className="space-y-4 animate-fade-in">
            {/* Cached notice */}
            {cached && (
              <div className="flex items-center justify-between border border-term-border bg-term-pane px-4 py-2">
                <p className="text-xs font-mono text-term-dim">
                  &gt; CACHED RESULT{' '}
                  <span className="text-term-muted">// last updated 6h ago</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => username && startAnalysis(username, true)}
                >
                  Refresh
                </Button>
              </div>
            )}

            {/* Profile header */}
            <ProfileHeader
              user={githubData.user}
              totalCommits90d={githubData.total_commits_90d}
              longestStreak={githubData.longest_streak_days}
              currentStreak={githubData.current_streak_days}
            />

            {/* Score cards */}
            <ScoreCards scores={githubData.scores} />

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LanguageChart languages={githubData.languages} />
              <ActivityChart activity={githubData.weekly_activity} />
            </div>

            {/* Top repos + AI analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 order-2 lg:order-1">
                <TopRepos repos={githubData.top_repos} />
              </div>
              <div className="lg:col-span-3 order-1 lg:order-2">
                <AnalysisPanel text={analysisText} status={status} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
