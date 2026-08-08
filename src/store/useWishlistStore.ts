import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistEntry, WishlistPriority, WishlistStatus } from '@/types/collection'
import type { PokemonCard } from '@/types/pokemon'

interface WishlistState {
  entries: Record<string, WishlistEntry>
  add: (card: PokemonCard) => void
  remove: (cardId: string) => void
  has: (cardId: string) => boolean
  update: (cardId: string, changes: Partial<WishlistEntry>) => void
  setPriority: (cardId: string, priority: WishlistPriority) => void
  setStatus: (cardId: string, status: WishlistStatus) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      entries: {},
      add: (card) =>
        set((state) => {
          if (state.entries[card.id]) return state
          const entry: WishlistEntry = {
            cardId: card.id,
            card,
            priority: 'medium',
            note: '',
            status: 'wanted',
            addedAt: new Date().toISOString(),
          }
          return { entries: { ...state.entries, [card.id]: entry } }
        }),
      remove: (cardId) =>
        set((state) => {
          const next = { ...state.entries }
          delete next[cardId]
          return { entries: next }
        }),
      has: (cardId) => Boolean(get().entries[cardId]),
      update: (cardId, changes) =>
        set((state) => {
          const entry = state.entries[cardId]
          if (!entry) return state
          return { entries: { ...state.entries, [cardId]: { ...entry, ...changes } } }
        }),
      setPriority: (cardId, priority) => get().update(cardId, { priority }),
      setStatus: (cardId, status) => get().update(cardId, { status }),
    }),
    { name: 'pokedeck-wishlist' },
  ),
)
