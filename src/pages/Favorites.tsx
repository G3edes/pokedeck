import { useMemo, useState } from 'react'
import { Folder, FolderPlus, Heart, Search } from 'lucide-react'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { PokemonCardTile } from '@/components/cards/PokemonCardTile'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

type SortOption = 'recent' | 'name'

export function Favorites() {
  const entriesMap = useFavoritesStore((s) => s.entries)
  const entries = useMemo(() => Object.values(entriesMap), [entriesMap])
  const folders = useFavoritesStore((s) => s.folders)
  const createFolder = useFavoritesStore((s) => s.createFolder)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('recent')
  const [activeFolder, setActiveFolder] = useState<string | 'all'>('all')
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const filtered = useMemo(() => {
    let list = entries.filter((e) => e.card.name.toLowerCase().includes(search.toLowerCase()))
    if (activeFolder !== 'all') list = list.filter((e) => e.folderIds.includes(activeFolder))
    return [...list].sort((a, b) =>
      sort === 'name' ? a.card.name.localeCompare(b.card.name) : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
  }, [entries, search, activeFolder, sort])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">Cartas Favoritas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organize suas cartas preferidas em listas.</p>
        </div>
        <Button variant="outline" onClick={() => setNewFolderOpen(true)}>
          <FolderPlus className="h-4 w-4" /> Nova pasta
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFolder('all')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
            activeFolder === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          <Heart className="h-3.5 w-3.5" /> Todas ({entries.length})
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              activeFolder === folder.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            <Folder className="h-3.5 w-3.5" /> {folder.name}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input icon={<Search className="h-4 w-4" />} placeholder="Pesquisar favoritos..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="sm:w-48">
          <option value="recent">Mais recentes</option>
          <option value="name">Nome A-Z</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhuma carta favoritada"
          description="Favorite cartas durante a exploração para vê-las aqui."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((entry) => (
            <PokemonCardTile key={entry.cardId} card={entry.card} />
          ))}
        </div>
      )}

      <Modal open={newFolderOpen} onClose={() => setNewFolderOpen(false)} title="Nova pasta de favoritos">
        <Input placeholder="Ex: Cartas para o próximo torneio" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (!newFolderName.trim()) return
            createFolder(newFolderName.trim())
            setNewFolderName('')
            setNewFolderOpen(false)
          }}
        >
          Criar pasta
        </Button>
      </Modal>
    </div>
  )
}
