import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Search, Settings, Sparkles } from 'lucide-react'
import { useDeckStore } from '@/store/useDeckStore'
import { useInfiniteCards } from '@/hooks/useCards'
import { useDebounce } from '@/hooks/useDebounce'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { CardGrid } from '@/components/cards/CardGrid'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeckBuilderEntryRow } from '@/components/decks/DeckBuilderEntryRow'
import { DeckSettingsModal } from '@/components/decks/DeckSettingsModal'
import { analyzeDeck } from '@/lib/deckAnalyzer'
import { maxCopiesAllowed, FORMAT_RULES } from '@/lib/deckRules'
import { toast } from '@/store/useToastStore'
import type { PokemonCard, Supertype } from '@/types/pokemon'

const SUPERTYPE_TABS: { id: 'all' | Supertype; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'Pokémon', label: 'Pokémon' },
  { id: 'Trainer', label: 'Treinadores' },
  { id: 'Energy', label: 'Energias' },
]

export function DeckEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deck = useDeckStore((s) => (id ? s.decks[id] : undefined))
  const updateDeck = useDeckStore((s) => s.updateDeck)
  const addCardToDeck = useDeckStore((s) => s.addCardToDeck)
  const removeCardFromDeck = useDeckStore((s) => s.removeCardFromDeck)
  const setCardQuantity = useDeckStore((s) => s.setCardQuantity)

  const [mobileView, setMobileView] = useState<'search' | 'deck'>('search')
  const [searchTerm, setSearchTerm] = useState('')
  const [supertypeTab, setSupertypeTab] = useState<'all' | Supertype>('all')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 400)

  const filters = useMemo(
    () => ({
      query: debouncedSearch || undefined,
      supertype: supertypeTab === 'all' ? undefined : supertypeTab,
    }),
    [debouncedSearch, supertypeTab],
  )

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteCards(filters)
  const results = data?.pages.flatMap((p) => p.data) ?? []
  const sentinelRef = useInfiniteScrollSentinel(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, Boolean(hasNextPage))

  const analysis = useMemo(() => (deck ? analyzeDeck(deck.cards, deck.format) : null), [deck])

  if (!deck || !analysis) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Deck não encontrado"
        action={<Button onClick={() => navigate('/decks')}>Voltar para meus decks</Button>}
      />
    )
  }

  const rules = FORMAT_RULES[deck.format]
  const totalCards = analysis.categoryCounts.total
  const deckId = deck.id

  function handleAdd(card: PokemonCard) {
    const result = addCardToDeck(deckId, card)
    if (result === 'added') {
      toast.success('Carta adicionada ao deck!', card.name)
    } else {
      toast.error('Não foi possível adicionar a carta.', 'Limite de cópias atingido para este formato.')
    }
  }

  const grouped = {
    Pokémon: deck.cards.filter((e) => e.card.supertype === 'Pokémon'),
    Trainer: deck.cards.filter((e) => e.card.supertype === 'Trainer'),
    Energy: deck.cards.filter((e) => e.card.supertype === 'Energy'),
  }

  const deckPanel = (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">{deck.name}</h3>
          <button onClick={() => setSettingsOpen(true)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-1 flex items-center justify-between text-sm font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Total de cartas</span>
          <span className={totalCards >= rules.totalCards ? 'text-leaf-600 dark:text-leaf-400' : 'text-slate-700 dark:text-slate-200'}>
            {totalCards} / {rules.totalCards}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (totalCards / rules.totalCards) * 100)}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
            <p className="font-bold text-slate-800 dark:text-slate-100">{analysis.categoryCounts.pokemon}</p>
            <p className="text-slate-400">Pokémon</p>
          </div>
          <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
            <p className="font-bold text-slate-800 dark:text-slate-100">{analysis.categoryCounts.trainer}</p>
            <p className="text-slate-400">Treinadores</p>
          </div>
          <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
            <p className="font-bold text-slate-800 dark:text-slate-100">{analysis.categoryCounts.energy}</p>
            <p className="text-slate-400">Energias</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {deck.cards.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhuma carta no deck ainda"
            description="Pesquise cartas ao lado e clique em adicionar."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {Object.entries(grouped).map(([label, entries]) =>
              entries.length === 0 ? null : (
                <div key={label}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    {label === 'Pokémon' ? 'Pokémon' : label === 'Trainer' ? 'Treinadores' : 'Energias'}
                    <Badge tone="slate">{entries.reduce((s, e) => s + e.quantity, 0)}</Badge>
                  </p>
                  <div className="flex flex-col gap-2">
                    {entries.map((entry) => (
                      <DeckBuilderEntryRow
                        key={entry.card.id}
                        entry={entry}
                        maxCopies={maxCopiesAllowed(deck.format, entry.card.supertype, entry.card.subtypes)}
                        onIncrement={() => handleAdd(entry.card)}
                        onDecrement={() => setCardQuantity(deck.id, entry.card.id, entry.quantity - 1)}
                        onRemove={() => removeCardFromDeck(deck.id, entry.card.id)}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <Button className="w-full" onClick={() => navigate(`/decks/${deck.id}`)}>
        <Check className="h-4 w-4" /> Concluir edição
      </Button>
    </div>
  )

  const searchPanel = (
    <div className="flex h-full flex-col gap-4">
      <Input
        icon={<Search className="h-4 w-4" />}
        placeholder="Pesquise cartas para adicionar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Tabs
        items={SUPERTYPE_TABS.map((t) => ({ id: t.id, label: t.label }))}
        activeId={supertypeTab}
        onChange={(t) => setSupertypeTab(t as typeof supertypeTab)}
      />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <CardGrid cards={results} isLoading={isLoading} onAddToDeck={handleAdd} />
        <div ref={sentinelRef} className="h-4" />
        {results.length === 0 && !isLoading && (
          <EmptyState icon={Search} title="Nenhuma carta encontrada" description="Tente outro termo de pesquisa." />
        )}
      </div>
    </div>
  )

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-7xl flex-col">
      <button
        onClick={() => navigate(`/decks/${deck.id}`)}
        className="mb-3 flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao deck
      </button>

      <div className="mb-3 shrink-0 lg:hidden">
        <Tabs
          items={[
            { id: 'search', label: 'Buscar cartas' },
            { id: 'deck', label: `Meu deck (${totalCards})` },
          ]}
          activeId={mobileView}
          onChange={(v) => setMobileView(v as typeof mobileView)}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className={mobileView === 'search' ? 'min-h-0' : 'hidden min-h-0 lg:block'}>{searchPanel}</div>
        <div className={mobileView === 'deck' ? 'min-h-0' : 'hidden min-h-0 lg:block'}>{deckPanel}</div>
      </div>

      <DeckSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        deck={deck}
        onSave={(changes) => updateDeck(deck.id, changes)}
      />
    </div>
  )
}
