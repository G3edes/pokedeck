import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Deck, SharedDeckSnapshot } from '@/types/deck'
import { generateId } from '@/lib/format'

/**
 * Simulates deck sharing without a backend: a snapshot of the deck is stored
 * locally under a short public id that can be looked up at /decks/shared/:id.
 * Sharing only works from the same browser this snapshot was created in.
 */
interface SharedDeckState {
  shares: Record<string, SharedDeckSnapshot>
  shareDeck: (deck: Deck, ownerName: string) => string
  getShare: (id: string) => SharedDeckSnapshot | undefined
  revokeShare: (id: string) => void
  findShareByDeckId: (deckId: string) => SharedDeckSnapshot | undefined
}

export const useSharedDeckStore = create<SharedDeckState>()(
  persist(
    (set, get) => ({
      shares: {},
      shareDeck: (deck, ownerName) => {
        const existing = get().findShareByDeckId(deck.id)
        const id = existing?.id ?? generateId().slice(0, 8).toUpperCase()
        const snapshot: SharedDeckSnapshot = {
          id,
          deck,
          ownerName,
          sharedAt: new Date().toISOString(),
        }
        set((state) => ({ shares: { ...state.shares, [id]: snapshot } }))
        return id
      },
      getShare: (id) => get().shares[id],
      revokeShare: (id) =>
        set((state) => {
          const next = { ...state.shares }
          delete next[id]
          return { shares: next }
        }),
      findShareByDeckId: (deckId) =>
        Object.values(get().shares).find((s) => s.deck.id === deckId),
    }),
    { name: 'pokedeck-shared-decks' },
  ),
)
