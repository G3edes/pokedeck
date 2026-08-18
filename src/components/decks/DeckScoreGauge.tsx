import { cn } from '@/lib/cn'

interface DeckScoreGaugeProps {
  score: number
  size?: number
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22a058'
  if (score >= 60) return '#4a5cf7'
  if (score >= 40) return '#f59e0b'
  return '#fd4d0d'
}

export function DeckScoreGauge({ score, size = 96 }: DeckScoreGaugeProps) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="8" className="stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-xl font-black leading-none')} style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] font-semibold text-slate-400">/100</span>
      </div>
    </div>
  )
}
