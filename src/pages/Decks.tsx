import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Plus, Upload } from 'lucide-react'
import { DeckCard } from '@/components/decks/DeckCard'
import { DeckCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Select } from '@/components/ui/Input'
import { useDeckStore } from '@/store/useDeckStore'
import { analyzeDeck } from '@/lib/deckAnalyzer'
import { parseDeckImport } from '@/lib/exportImport'
import { toast } from '@/store/useToastStore'

type SortOption = 'recent' | 'oldest' | 'score-desc' | 'score-asc' | 'name'
type FilterTab = 'active' | 'favorites' | 'archived'

export function Decks() {
  const navigate = useNavigate()
  const decksMap = useDeckStore((s) => s.decks)
  const allDecks = useMemo(() => Object.values(decksMap), [decksMap])
  const importDeck = useDeckStore((s) => s.importDeck)
  const [tab, setTab] = useState<FilterTab>('active')
  const [sort, setSort] = useState<SortOption>('recent')
  const [loading] = useState(false)

  const filteredDecks = useMemo(() => {
    let list = allDecks
    if (tab === 'active') list = list.filter((d) => !d.archived)
    if (tab === 'favorites') list = list.filter((d) => d.favorite && !d.archived)
    if (tab === 'archived') list = list.filter((d) => d.archived)

    const withScore = list.map((deck) => ({ deck, score: analyzeDeck(deck.cards, deck.format).score }))

    withScore.sort((a, b) => {
      switch (sort) {
        case 'recent':
          return new Date(b.deck.updatedAt).getTime() - new Date(a.deck.updatedAt).getTime()
        case 'oldest':
          return new Date(a.deck.updatedAt).getTime() - new Date(b.deck.updatedAt).getTime()
        case 'score-desc':
          return b.score - a.score
        case 'score-asc':
          return a.score - b.score
        case 'name':
          return a.deck.name.localeCompare(b.deck.name)
        default:
          return 0
      }
    })

    return withScore.map((w) => w.deck)
  }, [allDecks, tab, sort])

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const result = parseDeckImport(String(reader.result))
        if (!result.valid || !result.deck) {
          toast.error('Não foi possível importar o deck.', result.error)
          return
        }
        const imported = importDeck(result.deck)
        toast.success('Deck importado com sucesso!', imported.name)
        navigate(`/decks/${imported.id}`)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Meus Decks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Construa, analise e gerencie suas estratégias.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4" /> Importar
          </Button>
          <Button onClick={() => navigate('/decks/new')}>
            <Plus className="h-4 w-4" /> Criar novo deck
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Tabs
          items={[
            { id: 'active', label: 'Ativos', count: allDecks.filter((d) => !d.archived).length },
            { id: 'favorites', label: 'Favoritos', count: allDecks.filter((d) => d.favorite && !d.archived).length },
            { id: 'archived', label: 'Arquivados', count: allDecks.filter((d) => d.archived).length },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as FilterTab)}
        />
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="sm:w-56">
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
          <option value="score-desc">Maior score</option>
          <option value="score-asc">Menor score</option>
          <option value="name">Nome</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <DeckCardSkeleton key={i} />)}
        </div>
      ) : filteredDecks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={tab === 'active' ? 'Você ainda não possui nenhum deck.' : 'Nada por aqui ainda.'}
          description="Monte seu primeiro deck combinando Pokémon, treinadores e energias."
          action={
            <Button onClick={() => navigate('/decks/new')}>
              <Plus className="h-4 w-4" /> Criar meu primeiro deck
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  )
}
