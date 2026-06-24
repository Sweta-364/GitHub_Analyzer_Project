import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <footer className="border-t border-term-border py-6 text-center text-xs text-term-muted font-mono">
        <p>
          {'// gitpulse v0.1.0 | MIT license | '}
          <a href="https://github.com" className="hover:text-term-dim transition-colors">github</a>
        </p>
      </footer>
    </div>
  )
}
