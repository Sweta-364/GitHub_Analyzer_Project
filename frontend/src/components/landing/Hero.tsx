import { useState, type FormEvent } from 'react'
import { useAnalysis } from '@/hooks/useAnalysis'

const EXAMPLE_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803']

const ASCII_LOGO = `  ██████╗ ██╗████████╗    ██████╗ ██╗   ██╗██╗      ███████╗███████╗
 ██╔════╝ ██║╚══██╔══╝    ██╔══██╗██║   ██║██║      ██╔════╝██╔════╝
 ██║  ███╗██║   ██║       ██████╔╝██║   ██║██║      ███████╗█████╗
 ██║   ██║██║   ██║       ██╔═══╝ ██║   ██║██║      ╚════██║██╔══╝
 ╚██████╔╝██║   ██║       ██║     ╚██████╔╝███████╗ ███████║███████╗
  ╚═════╝ ╚═╝   ╚═╝       ╚═╝      ╚═════╝ ╚══════╝ ╚══════╝╚══════╝`

export default function Hero() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { startAnalysis } = useAnalysis()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = username.trim().replace(/^@/, '')
    if (!trimmed) return
    setLoading(true)
    startAnalysis(trimmed)
  }

  function handleExample(user: string) {
    setUsername(user)
    startAnalysis(user)
  }

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center overflow-hidden">
      {/* ASCII logo */}
      <pre
        aria-hidden="true"
        className="hidden sm:block text-term-green text-[8px] sm:text-[10px] leading-tight glow-sm font-mono mb-6 select-none overflow-x-auto max-w-full"
      >
        {ASCII_LOGO}
      </pre>

      {/* Mobile title */}
      <div className="sm:hidden mb-4 text-2xl font-bold text-term-green glow tracking-widest">
        GIT<span className="text-term-amber">PULSE</span>
      </div>

      {/* Status badge */}
      <div className="mb-6 inline-flex items-center gap-2 border border-term-border bg-term-pane px-4 py-1.5 text-xs text-term-dim">
        <span className="h-1.5 w-1.5 bg-term-green animate-pulse-slow inline-block" />
        <span>&gt; POWERED BY AI</span>
      </div>

      {/* Subtitle */}
      <p className="mb-8 text-term-dim text-sm max-w-xl">
        {'// AI-powered GitHub developer profile analyzer'}
      </p>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="border border-term-border bg-term-pane flex items-center gap-2 px-4 h-14 w-full">
          <span className="text-term-dim whitespace-nowrap text-sm select-none flex-shrink-0">
            user@gitpulse:~$
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="github_username"
            className="flex-1 bg-transparent text-term-green outline-none placeholder:text-term-muted text-sm min-w-0"
            style={{ caretColor: '#33ff00' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="h-9 px-4 text-sm font-mono border border-term-green text-term-green bg-transparent hover:bg-term-green hover:text-black transition-all disabled:opacity-40 disabled:pointer-events-none tracking-wide flex-shrink-0"
          >
            {loading ? (
              <span className="animate-blink">&gt; ...</span>
            ) : (
              <>
                <span className="opacity-60">[</span>
                {' ANALYZE '}
                <span className="opacity-60">]</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example users */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-term-muted">$ try:</span>
        {EXAMPLE_USERS.map((user) => (
          <button
            key={user}
            onClick={() => handleExample(user)}
            className="border border-term-border text-term-dim hover:text-term-green hover:border-term-green transition-all px-2 py-0.5 font-mono"
          >
            @{user}
          </button>
        ))}
      </div>
    </section>
  )
}
