import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Layers, Library, Plus, Search, Sparkles, TrendingUp } from 'lucide-react'
import { useFeaturedCards, usePopularCards, useRecentlyViewedCards, useCatalogSize } from '@/hooks/useDashboardData'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useCollectionStore } from '@/store/useCollectionStore'
import { useDeckStore } from '@/store/useDeckStore'
import { useUserStore } from '@/store/useUserStore'
import { StatCard } from '@/components/ui/StatCard'
import { PokemonCardTile } from '@/components/cards/PokemonCardTile'
import { CardTileSkeleton } from '@/components/ui/Skeleton'
import { DeckCard } from '@/components/decks/DeckCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/format'

export function Dashboard() {
  const profile = useUserStore((s) => s.profile)
  const favoritesMap = useFavoritesStore((s) => s.entries)
  const collectionMap = useCollectionStore((s) => s.entries)
  const decksMap = useDeckStore((s) => s.decks)
  const favorites = useMemo(() => Object.values(favoritesMap), [favoritesMap])
  const collectionEntries = useMemo(() => Object.values(collectionMap), [collectionMap])
  const decks = useMemo(() => Object.values(decksMap).filter((d) => !d.archived), [decksMap])

  const { data: catalogSize } = useCatalogSize()
  const { data: featuredCards, isLoading: loadingFeatured } = useFeaturedCards()
  const { data: popularCards, isLoading: loadingPopular } = usePopularCards()
  const { data: recentlyViewed } = useRecentlyViewedCards()

  const mostUsedDeck = useMemo(
    () => [...decks].sort((a, b) => b.timesOpened - a.timesOpened)[0],
    [decks],
  )
  const recentDecks = useMemo(
    () => [...decks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
    [decks],
  )
  const recentCollectionAdds = useMemo(
    () => [...collectionEntries].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 6),
    [collectionEntries],
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-aurora bg-slate-900 p-8 text-white shadow-glow sm:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-white/70">Bem-vindo de volta,</p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">{profile.name}</h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Explore o catálogo completo do Pokémon TCG, monte decks poderosos e organize sua coleção pessoal.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/cards">
                <Button variant="secondary">
                  <Search className="h-4 w-4" /> Explorar cartas
                </Button>
              </Link>
              <Link to="/decks/new">
                <Button className="bg-white text-brand-700 hover:bg-white/90">
                  <Plus className="h-4 w-4" /> Criar deck
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden animate-float sm:block">
            <Sparkles className="h-24 w-24 text-white/20" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Search} label="Cartas no catálogo" value={catalogSize ? catalogSize.toLocaleString('pt-BR') : '—'} tone="brand" />
        <StatCard icon={Heart} label="Cartas favoritas" value={favorites.length} tone="ember" />
        <StatCard icon={Layers} label="Decks criados" value={decks.length} tone="violet" />
        <StatCard icon={Library} label="Cartas na coleção" value={collectionEntries.reduce((s, e) => s + e.quantity, 0)} tone="leaf" />
      </div>

      {mostUsedDeck && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: mostUsedDeck.color }}>
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deck mais utilizado</p>
              <p className="font-bold text-slate-900 dark:text-white">{mostUsedDeck.name}</p>
              <p className="text-xs text-slate-400">Aberto {mostUsedDeck.timesOpened}x · atualizado {formatRelativeTime(mostUsedDeck.updatedAt)}</p>
            </div>
          </div>
          <Link to={`/decks/${mostUsedDeck.id}`}>
            <Button variant="outline" size="sm">
              Abrir <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <section className="mb-10">
        <SectionHeader title="Explore o Pokémon TCG" to="/cards" />
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-3">
          {loadingFeatured
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-40 shrink-0"><CardTileSkeleton /></div>)
            : featuredCards?.map((card) => (
                <div key={card.id} className="w-40 shrink-0">
                  <PokemonCardTile card={card} />
                </div>
              ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Seus decks" to="/decks" />
        {decks.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Você ainda não possui nenhum deck."
            description="Monte seu primeiro deck combinando Pokémon, treinadores e energias."
            action={
              <Link to="/decks/new">
                <Button>
                  <Plus className="h-4 w-4" /> Criar meu primeiro deck
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <SectionHeader title="Cartas populares" to="/cards" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {loadingPopular
            ? Array.from({ length: 8 }).map((_, i) => <CardTileSkeleton key={i} />)
            : popularCards?.map((card) => <PokemonCardTile key={card.id} card={card} />)}
        </div>
      </section>

      {recentCollectionAdds.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Cartas adicionadas recentemente" to="/collection" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {recentCollectionAdds.map((entry) => (
              <PokemonCardTile key={entry.cardId} card={entry.card} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section>
          <SectionHeader title="Últimas cartas visualizadas" to="/cards" />
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-3">
            {recentlyViewed.map((card) => (
              <div key={card.id} className="w-36 shrink-0">
                <PokemonCardTile card={card} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <Link to={to} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
        Ver tudo <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
