import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-surface-800 mb-4 font-mono">404</p>
      <h1 className="text-2xl font-semibold text-white mb-3">Page not found</h1>
      <p className="text-slate-400 mb-8">This page doesn't exist. Let's get you back to analyzing code.</p>
      <Link to="/">
        <Button variant="primary">Back to GitPulse</Button>
      </Link>
    </div>
  )
}
