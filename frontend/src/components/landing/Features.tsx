const FEATURES = [
  {
    module: 'LANG_ANALYSIS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-term-green">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Language trend analysis',
    description: 'See how your language usage has shifted over months. Spot what you\'re doubling down on and what you\'re moving away from.',
  },
  {
    module: 'CONSISTENCY',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-term-green">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Consistency scoring',
    description: 'Quantified commit cadence. Know whether you ship steadily or in bursts — and what that means for your workflow.',
  },
  {
    module: 'AI_INSIGHTS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-term-green">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'AI-generated insights',
    description: 'AI reads your entire coding history and surfaces patterns you\'d never spot yourself — with specific, actionable recommendations.',
  },
  {
    module: 'COLLAB_INDEX',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-term-green">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Collaboration index',
    description: 'How much you contribute outside your own repos — PRs to others, issue discussions, open source engagement.',
  },
  {
    module: 'SKILL_GAPS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-term-green">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Skill gap detection',
    description: 'Based on your current trajectory, AI identifies the exact skills most worth developing next — with concrete learning paths.',
  },
  {
    module: 'STREAM_OUT',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-term-green">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Instant, streaming',
    description: 'Analysis streams in token-by-token — no waiting for the full response. Results appear in seconds, not minutes.',
  },
]

export default function Features() {
  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      <div className="mb-10">
        <p className="text-term-green text-base font-bold glow-sm mb-1">
          $ gitpulse --help
        </p>
        <p className="text-term-muted text-sm">
          {'# available analysis modules'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="border border-term-border bg-term-pane p-5 hover:border-term-green transition-all duration-200 group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 mt-0.5">
                {feature.icon}
              </div>
              <div className="min-w-0">
                <p className="text-term-amber text-xs font-mono mb-1 tracking-wider">
                  <span className="opacity-60">[</span>{feature.module}<span className="opacity-60">]</span>
                </p>
                <h3 className="text-term-green text-sm font-bold tracking-wide group-hover:glow-sm transition-all">
                  {feature.title}
                </h3>
              </div>
            </div>
            <p className="text-term-dim text-xs leading-relaxed pl-8">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
