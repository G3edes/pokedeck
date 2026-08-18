import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DeckAnalysis } from '@/types/deck'
import { getEnergyTypeHex } from '@/lib/energyTypes'

const CATEGORY_COLORS = ['#4a5cf7', '#fd4d0d', '#22a058']

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,0.2)',
  fontSize: 12,
  fontWeight: 600,
}

export function CategoryPieChart({ categoryCounts }: { categoryCounts: DeckAnalysis['categoryCounts'] }) {
  const data = [
    { name: 'Pokémon', value: categoryCounts.pokemon },
    { name: 'Treinadores', value: categoryCounts.trainer },
    { name: 'Energias', value: categoryCounts.energy },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return <EmptyChartState />
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {data.map((_, index) => (
            <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TypeDistributionChart({ typeDistribution }: { typeDistribution: Record<string, number> }) {
  const data = Object.entries(typeDistribution)
    .map(([type, value]) => ({ type, value }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return <EmptyChartState />

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-100 dark:stroke-slate-800" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="type" width={80} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((entry) => (
            <Cell key={entry.type} fill={getEnergyTypeHex(entry.type)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RetreatCurveChart({ retreatCurve }: { retreatCurve: Record<number, number> }) {
  const maxCost = Math.max(4, ...Object.keys(retreatCurve).map(Number))
  const data = Array.from({ length: maxCost + 1 }, (_, cost) => ({
    cost: String(cost),
    value: retreatCurve[cost] ?? 0,
  }))

  if (Object.keys(retreatCurve).length === 0) return <EmptyChartState />

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
        <XAxis dataKey="cost" tick={{ fontSize: 11 }} label={{ value: 'Custo de recuo', position: 'insideBottom', offset: -4, fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#4a5cf7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RarityDistributionChart({ rarityDistribution }: { rarityDistribution: Record<string, number> }) {
  const data = Object.entries(rarityDistribution)
    .map(([rarity, value]) => ({ rarity, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (data.length === 0) return <EmptyChartState />

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
        <XAxis dataKey="rarity" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyChartState() {
  return (
    <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
      Sem dados suficientes ainda.
    </div>
  )
}
