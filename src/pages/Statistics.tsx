import { useMemo, type ReactNode } from 'react'
import { Award, BarChart3, Gem, Heart, Layers, Library, Package, Sparkles, Trophy, type LucideIcon } from 'lucide-react'
import { useCollectionStore } from '@/store/useCollectionStore'
import { useDeckStore } from '@/store/useDeckStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { StatCard } from '@/components/ui/StatCard'
import { TypeDistributionChart, RarityDistributionChart } from '@/components/charts/DeckCharts'
import { analyzeDeck } from '@/lib/deckAnalyzer'
import { computeAchievements } from '@/lib/achievements'
import { cn } from '@/lib/cn'

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  Trophy,
  Layers,
  Package,
  Gem,
  Award,
  Heart,
  Sparkles,
}

export function Statistics() {
  const collectionMap = useCollectionStore((s) => s.entries)
  const decksMap = useDeckStore((s) => s.decks)
  const collectionEntries = useMemo(() => Object.values(collectionMap), [collectionMap])
  const decks = useMemo(() => Object.values(decksMap), [decksMap])
  const favoritesCount = useFavoritesStore((s) => Object.keys(s.entries).length)

  const stats = useMemo(() => {
    const totalCards = collectionEntries.reduce((sum, e) => sum + e.quantity, 0)
    const pokemonCount = collectionEntries.filter((e) => e.card.supertype === 'Pokémon').reduce((s, e) => s + e.quantity, 0)
    const trainerCount = collectionEntries.filter((e) => e.card.supertype === 'Trainer').reduce((s, e) => s + e.quantity, 0)
    const energyCount = collectionEntries.filter((e) => e.card.supertype === 'Energy').reduce((s, e) => s + e.quantity, 0)

    const typeDistribution: Record<string, number> = {}
    const rarityDistribution: Record<string, number> = {}
    const setDistribution: Record<string, number> = {}
    for (const entry of collectionEntries) {
      for (const type of entry.card.types ?? []) {
        typeDistribution[type] = (typeDistribution[type] ?? 0) + entry.quantity
      }
      if (entry.card.rarity) rarityDistribution[entry.card.rarity] = (rarityDistribution[entry.card.rarity] ?? 0) + entry.quantity
      setDistribution[entry.card.set.name] = (setDistribution[entry.card.set.name] ?? 0) + entry.quantity
    }

    const deckTypeUsage: Record<string, number> = {}
    let highestDeckScore = 0
    const completedSets = new Set<string>()
    const bySet = new Map<string, { owned: number; total: number }>()
    for (const entry of collectionEntries) {
      const current = bySet.get(entry.card.set.id) ?? { owned: 0, total: entry.card.set.printedTotal }
      current.owned += 1
      bySet.set(entry.card.set.id, current)
    }
    for (const [setId, info] of bySet) {
      if (info.total > 0 && info.owned >= info.total) completedSets.add(setId)
    }

    for (const deck of decks) {
      const analysis = analyzeDeck(deck.cards, deck.format)
      highestDeckScore = Math.max(highestDeckScore, analysis.score)
      for (const [type, count] of Object.entries(analysis.typeDistribution)) {
        deckTypeUsage[type] = (deckTypeUsage[type] ?? 0) + count
      }
    }

    return {
      totalCards,
      pokemonCount,
      trainerCount,
      energyCount,
      typeDistribution,
      rarityDistribution,
      setDistribution,
      deckTypeUsage,
      highestDeckScore,
      completedSets: completedSets.size,
    }
  }, [collectionEntries, decks])

  const achievements = computeAchievements({
    deckCount: decks.length,
    cardCount: stats.totalCards,
    favoriteCount: favoritesCount,
    collectionUniqueCount: collectionEntries.length,
    completedSets: stats.completedSets,
    highestDeckScore: stats.highestDeckScore,
  })

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Estatísticas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Uma visão geral da sua jornada como treinador.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Library} label="Total de cartas" value={stats.totalCards} tone="brand" />
        <StatCard icon={Layers} label="Decks criados" value={decks.length} tone="violet" />
        <StatCard icon={Heart} label="Favoritos" value={favoritesCount} tone="ember" />
        <StatCard icon={BarChart3} label="Maior Deck Score" value={stats.highestDeckScore || '—'} tone="leaf" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <MiniCard label="Pokémon" value={stats.pokemonCount} />
        <MiniCard label="Treinadores" value={stats.trainerCount} />
        <MiniCard label="Energias" value={stats.energyCount} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ChartCard title="Cartas por tipo (coleção)">
          <TypeDistributionChart typeDistribution={stats.typeDistribution} />
        </ChartCard>
        <ChartCard title="Cartas por raridade (coleção)">
          <RarityDistributionChart rarityDistribution={stats.rarityDistribution} />
        </ChartCard>
        <ChartCard title="Tipos mais usados nos decks">
          <TypeDistributionChart typeDistribution={stats.deckTypeUsage} />
        </ChartCard>
        <ChartCard title="Coleção por set">
          <RarityDistributionChart rarityDistribution={stats.setDistribution} />
        </ChartCard>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <Trophy className="h-5 w-5 text-amber-500" /> Conquistas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((achievement) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Trophy
            const unlocked = Boolean(achievement.unlockedAt)
            return (
              <div
                key={achievement.id}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition',
                  unlocked
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
                    : 'border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900',
                )}
              >
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', unlocked ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-800')}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{achievement.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{achievement.description}</p>
              </div>
            )
          })}
        </div>
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

function MiniCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
