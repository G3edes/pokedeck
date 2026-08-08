import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FavoriteEntry, FavoriteFolder } from '@/types/collection'
import type { PokemonCard } from '@/types/pokemon'
import { generateId } from '@/lib/format'

interface FavoritesState {
  entries: Record<string, FavoriteEntry>
  folders: FavoriteFolder[]
  isFavorite: (cardId: string) => boolean
  toggleFavorite: (card: PokemonCard) => boolean
  removeFavorite: (cardId: string) => void
  setNote: (cardId: string, note: string) => void
  createFolder: (name: string) => FavoriteFolder
  deleteFolder: (folderId: string) => void
  assignToFolder: (cardId: string, folderId: string, assigned: boolean) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      entries: {},
      folders: [
        { id: 'default', name: 'Pokémon favoritos', createdAt: new Date().toISOString() },
      ],
      isFavorite: (cardId) => Boolean(get().entries[cardId]),
      toggleFavorite: (card) => {
        const exists = Boolean(get().entries[card.id])
        set((state) => {
          const next = { ...state.entries }
          if (exists) {
            delete next[card.id]
          } else {
            next[card.id] = {
              cardId: card.id,
              card,
              folderIds: ['default'],
              note: '',
              addedAt: new Date().toISOString(),
            }
          }
          return { entries: next }
        })
        return !exists
      },
      removeFavorite: (cardId) =>
        set((state) => {
          const next = { ...state.entries }
          delete next[cardId]
          return { entries: next }
        }),
      setNote: (cardId, note) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          return { entries: { ...state.entries, [cardId]: { ...entry, note } } }
        }),
      createFolder: (name) => {
        const folder: FavoriteFolder = { id: generateId(), name, createdAt: new Date().toISOString() }
        set((state) => ({ folders: [...state.folders, folder] }))
        return folder
      },
      deleteFolder: (folderId) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          entries: Object.fromEntries(
            Object.entries(state.entries).map(([id, entry]) => [
              id,
              { ...entry, folderIds: entry.folderIds.filter((f) => f !== folderId) },
            ]),
          ),
        })),
      assignToFolder: (cardId, folderId, assigned) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          const folderIds = assigned
            ? [...new Set([...entry.folderIds, folderId])]
            : entry.folderIds.filter((f) => f !== folderId)
          return { entries: { ...state.entries, [cardId]: { ...entry, folderIds } } }
        }),
    }),
    { name: 'pokedeck-favorites' },
  ),
)
