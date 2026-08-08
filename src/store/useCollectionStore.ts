import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardCondition, CollectionEntry, OwnershipStatus } from '@/types/collection'
import type { PokemonCard } from '@/types/pokemon'

interface CollectionState {
  entries: Record<string, CollectionEntry>
  addOrUpdate: (card: PokemonCard, changes?: Partial<CollectionEntry>) => void
  remove: (cardId: string) => void
  setStatus: (card: PokemonCard, status: OwnershipStatus) => void
  setQuantity: (cardId: string, quantity: number) => void
  setDuplicates: (cardId: string, duplicates: number) => void
  setCondition: (cardId: string, condition: CardCondition) => void
  setNote: (cardId: string, note: string) => void
  has: (cardId: string) => boolean
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      entries: {},
      addOrUpdate: (card, changes) =>
        set((state) => {
          const existing = state.entries[card.id]
          const entry: CollectionEntry = {
            cardId: card.id,
            card,
            status: existing?.status ?? 'owned',
            quantity: existing?.quantity ?? 1,
            duplicates: existing?.duplicates ?? 0,
            condition: existing?.condition ?? 'Near Mint',
            note: existing?.note ?? '',
            addedAt: existing?.addedAt ?? new Date().toISOString(),
            ...changes,
          }
          return { entries: { ...state.entries, [card.id]: entry } }
        }),
      remove: (cardId) =>
        set((state) => {
          const next = { ...state.entries }
          delete next[cardId]
          return { entries: next }
        }),
      setStatus: (card, status) => get().addOrUpdate(card, { status }),
      setQuantity: (cardId, quantity) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          return { entries: { ...state.entries, [cardId]: { ...entry, quantity: Math.max(0, quantity) } } }
        }),
      setDuplicates: (cardId, duplicates) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          return { entries: { ...state.entries, [cardId]: { ...entry, duplicates: Math.max(0, duplicates) } } }
        }),
      setCondition: (cardId, condition) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          return { entries: { ...state.entries, [cardId]: { ...entry, condition } } }
        }),
      setNote: (cardId, note) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          return { entries: { ...state.entries, [cardId]: { ...entry, note } } }
        }),
      has: (cardId) => Boolean(get().entries[cardId]),
    }),
    { name: 'pokedeck-collection' },
  ),
)
