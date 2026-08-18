import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Copy, Layers, Sparkles } from 'lucide-react'
import { useSharedDeckStore } from '@/store/useSharedDeckStore'
import { useDeckStore } from '@/store/useDeckStore'
import { PokemonCardTile } from '@/components/cards/PokemonCardTile'
import { DeckScoreGauge } from '@/components/decks/DeckScoreGauge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { analyzeDeck } from '@/lib/deckAnalyzer'
import { toast } from '@/store/useToastStore'

export function SharedDeck() {
  const { shareId } = useParams<{ shareId: string }>()
  const snapshot = useSharedDeckStore((s) => (shareId ? s.getShare(shareId) : undefined))
  const importDeck = useDeckStore((s) => s.importDeck)

  const analysis = useMemo(
    () => (snapshot ? analyzeDeck(snapshot.deck.cards, snapshot.deck.format) : null),
    [snapshot],
  )

  if (!snapshot || !analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
        <EmptyState
          icon={Layers}
          title="Deck não encontrado"
          description="Este link de compartilhamento é inválido ou foi criado em outro navegador. O compartilhamento do PokéDeck funciona localmente, por isso links só abrem no dispositivo onde foram gerados."
          action={
            <Link to="/">
              <Button>Ir para o PokéDeck</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const { deck } = snapshot
  const grouped = {
    Pokémon: deck.cards.filter((e) => e.card.supertype === 'Pokémon'),
    Trainer: deck.cards.filter((e) => e.card.supertype === 'Trainer'),
    Energy: deck.cards.filter((e) => e.card.supertype === 'Energy'),
  }

  function handleCopyDeck() {
    const imported = importDeck(deck)
    toast.success('Deck copiado para a sua conta!', imported.name)
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-bold text-slate-900 dark:text-white">PokéDeck</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div
          className="relative mb-8 overflow-hidden rounded-2xl p-6 text-white shadow-glow sm:p-8"
          style={{ background: `linear-gradient(135deg, ${deck.color}, ${deck.color}99)` }}
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Deck público · por {snapshot.ownerName}
              </p>
              <h1 className="mt-1 text-3xl font-black text-white">{deck.name}</h1>
              {deck.description && <p className="mt-2 max-w-lg text-sm text-white/85">{deck.description}</p>}
            </div>
            <div className="flex flex-col items-center gap-3">
              <DeckScoreGauge score={analysis.score} />
              <Button variant="secondary" onClick={handleCopyDeck}>
                <Copy className="h-4 w-4" /> Copiar deck
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4 text-center">
          <MiniStat label="Pokémon" value={analysis.categoryCounts.pokemon} />
          <MiniStat label="Treinadores" value={analysis.categoryCounts.trainer} />
          <MiniStat label="Energias" value={analysis.categoryCounts.energy} />
        </div>

        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([label, entries]) =>
            entries.length === 0 ? null : (
              <div key={label}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  {label === 'Pokémon' ? 'Pokémon' : label === 'Trainer' ? 'Treinadores' : 'Energias'}
                  <Badge tone="slate">{entries.reduce((sum, e) => sum + e.quantity, 0)}</Badge>
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {entries.map((entry) => (
                    <div key={entry.card.id} className="relative">
                      <PokemonCardTile card={entry.card} />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white shadow-lg dark:bg-white dark:text-slate-900">
                        {entry.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </main>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
