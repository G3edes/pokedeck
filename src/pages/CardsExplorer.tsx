import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, ListFilter, Search, X } from 'lucide-react'
import { CardGrid } from '@/components/cards/CardGrid'
import { CardFiltersPanel } from '@/components/cards/CardFiltersPanel'
import { AddToDeckModal } from '@/components/cards/AddToDeckModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { useInfiniteCards } from '@/hooks/useCards'
import { useDebounce } from '@/hooks/useDebounce'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCompareStore, MAX_COMPARE } from '@/store/useCompareStore'
import { toast } from '@/store/useToastStore'
import { getCardMarketPrice } from '@/lib/format'
import type { CardFilters, PokemonCard } from '@/types/pokemon'
import { ApiError } from '@/api/client'

export function CardsExplorer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '')
  const [filters, setFilters] = useState<CardFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [deckModalCard, setDeckModalCard] = useState<PokemonCard | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 400)
  const addSearch = useHistoryStore((s) => s.addSearch)
  const recentSearches = useHistoryStore((s) => s.recentSearches)
  const compareCards = useCompareStore((s) => s.cards)
  const toggleCompare = useCompareStore((s) => s.toggle)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearchTerm(q)
  }, [searchParams])

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      addSearch(debouncedSearch)
      setSearchParams(debouncedSearch ? { q: debouncedSearch } : {}, { replace: true })
    }
  }, [debouncedSearch, addSearch, setSearchParams])

  const activeFilters: Omit<CardFilters, 'page' | 'pageSize'> = useMemo(
    () => ({ ...filters, query: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  )

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, isError, error, refetch } =
    useInfiniteCards(activeFilters)

  const cards = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.data) ?? []
    if (filters.sortField === 'price') {
      const sorted = [...all].sort((a, b) => {
        const priceA = getCardMarketPrice(a) ?? 0
        const priceB = getCardMarketPrice(b) ?? 0
        return filters.sortOrder === 'desc' ? priceB - priceA : priceA - priceB
      })
      return sorted
    }
    return all
  }, [data, filters.sortField, filters.sortOrder])

  const totalCount = data?.pages[0]?.totalCount ?? 0
  const sentinelRef = useInfiniteScrollSentinel(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, Boolean(hasNextPage))

  const handleAddToDeck = (card: PokemonCard) => setDeckModalCard(card)

  const handleCompareToggle = (card: PokemonCard) => {
    const alreadyIn = compareCards.some((c) => c.id === card.id)
    if (!alreadyIn && compareCards.length >= MAX_COMPARE) {
      toast.warning(`Você só pode comparar até ${MAX_COMPARE} cartas.`)
      return
    }
    toggleCompare(card)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Explorar Cartas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {totalCount > 0 ? `${totalCount.toLocaleString('pt-BR')} cartas encontradas` : 'Pesquise pelo catálogo completo do Pokémon TCG'}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Pesquise por nome, número ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSearchParams({})
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
          <ListFilter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      {!searchTerm && recentSearches.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Pesquisas recentes:</span>
          {recentSearches.slice(0, 6).map((s) => (
            <button
              key={s.id}
              onClick={() => setSearchTerm(s.term)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {s.term}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block lg:h-fit lg:sticky lg:top-20">
          <CardFiltersPanel filters={filters} onChange={setFilters} onReset={() => setFilters({})} />
        </aside>

        <div>
          {isError && (
            <EmptyState
              icon={AlertCircle}
              title="Não foi possível carregar as cartas"
              description={error instanceof ApiError ? error.message : 'Tente novamente em instantes.'}
              action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
            />
          )}

          {!isError && !isLoading && cards.length === 0 && (
            <EmptyState
              icon={Search}
              title="Nenhuma carta encontrada"
              description="Tente ajustar os termos de pesquisa ou os filtros aplicados."
              action={
                <Button variant="outline" onClick={() => { setFilters({}); setSearchTerm('') }}>
                  Limpar filtros
                </Button>
              }
            />
          )}

          {!isError && (cards.length > 0 || isLoading) && (
            <>
              <CardGrid
                cards={cards}
                isLoading={isLoading}
                onAddToDeck={handleAddToDeck}
                onCompareToggle={handleCompareToggle}
                compareIds={compareCards.map((c) => c.id)}
                compareLimitReached={compareCards.length >= MAX_COMPARE}
              />
              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <p className="py-6 text-center text-sm text-slate-400">Carregando mais cartas...</p>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros" side="bottom">
        <CardFiltersPanel filters={filters} onChange={setFilters} onReset={() => setFilters({})} />
        <Button className="mt-5 w-full" onClick={() => setFiltersOpen(false)}>
          Ver resultados
        </Button>
      </Drawer>

      <AddToDeckModal open={Boolean(deckModalCard)} onClose={() => setDeckModalCard(null)} card={deckModalCard} />
    </div>
  )
}
