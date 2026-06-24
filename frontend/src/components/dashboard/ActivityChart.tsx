import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { WeeklyActivity } from '@/types'

interface ActivityChartProps {
  activity: WeeklyActivity[]
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-term-pane border border-term-border px-3 py-2 text-xs font-mono">
      <p className="text-term-green font-bold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function ActivityChart({ activity }: ActivityChartProps) {
  const data = activity.map((w) => ({
    week: formatWeek(w.week),
    Commits: w.commits,
    PRs: w.prs,
  }))

  return (
    <div className="border border-term-border bg-term-pane">
      {/* Title bar */}
      <div className="bg-[#081408] border-b border-term-border px-4 py-1.5 text-xs">
        <span className="text-term-muted">┌─[</span>
        <span className="text-term-green tracking-widest font-bold ml-1">WEEKLY ACTIVITY</span>
        <span className="text-term-muted">]</span>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-term-muted text-xs mb-4 font-mono">
          $ git log --stat --weekly
        </p>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f521f" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: '#22aa00', fontFamily: 'JetBrains Mono', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#22aa00', fontFamily: 'JetBrains Mono', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(51,255,0,0.04)' }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                color: '#22aa00',
                paddingTop: 8,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Bar dataKey="Commits" fill="#33ff00" opacity={0.9} maxBarSize={20} />
            <Bar dataKey="PRs" fill="#ffb000" maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
