import type { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'
import type { DeckAnalysis } from '@/types/deck'
import { DeckScoreGauge } from './DeckScoreGauge'
import {
  CategoryPieChart,
  RarityDistributionChart,
  RetreatCurveChart,
  TypeDistributionChart,
} from '@/components/charts/DeckCharts'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function DeckAnalysisPanel({ analysis }: { analysis: DeckAnalysis }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <DeckScoreGauge score={analysis.score} size={110} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deck Score</h3>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Pontuação heurística baseada em equilíbrio, consistência e curva do deck.
          </p>
          <div className="flex flex-col gap-2">
            {analysis.scoreBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span className="w-36 shrink-0 font-semibold text-slate-500 dark:text-slate-400">{item.label}</span>
                <ProgressBar value={item.points} max={item.max} />
                <span className="w-12 shrink-0 text-right font-semibold text-slate-500">
                  {item.points}/{item.max}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Recomendações (heurísticas)</h3>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm text-amber-800/90 dark:text-amber-200/90">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span> {rec}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-700/70 dark:text-amber-300/60">
            Estas são apenas sugestões baseadas em heurísticas de montagem de decks, não regras oficiais do Pokémon TCG.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ChartCard title="Pokémon x Treinadores x Energias">
          <CategoryPieChart categoryCounts={analysis.categoryCounts} />
        </ChartCard>
        <ChartCard title="Tipos de Pokémon">
          <TypeDistributionChart typeDistribution={analysis.typeDistribution} />
        </ChartCard>
        <ChartCard title="Curva de custo de recuo">
          <RetreatCurveChart retreatCurve={analysis.retreatCurve} />
        </ChartCard>
        <ChartCard title="Distribuição de raridade">
          <RarityDistributionChart rarityDistribution={analysis.rarityDistribution} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="HP médio" value={analysis.averageHp || '—'} />
        <MiniStat label="Recuo médio" value={analysis.averageConvertedRetreatCost || '—'} />
        <MiniStat label="Total de cartas" value={analysis.categoryCounts.total} />
        <MiniStat label="Tipos distintos" value={Object.keys(analysis.typeDistribution).length} />
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h4>
      {children}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
