import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Deck, DeckFormat } from '@/types/deck'
import type { PokemonCard } from '@/types/pokemon'
import { generateId } from '@/lib/format'
import { maxCopiesAllowed } from '@/lib/deckRules'

export interface CreateDeckInput {
  name: string
  description: string
  format: DeckFormat
  color: string
  tags: string[]
  coverImage?: string
}

interface DeckState {
  decks: Record<string, Deck>
  createDeck: (input: CreateDeckInput) => Deck
  updateDeck: (id: string, changes: Partial<Deck>) => void
  deleteDeck: (id: string) => void
  duplicateDeck: (id: string) => Deck | undefined
  toggleFavoriteDeck: (id: string) => void
  toggleArchiveDeck: (id: string) => void
  registerOpen: (id: string) => void
  addComment: (id: string, text: string) => void
  removeComment: (id: string, commentId: string) => void
  addCardToDeck: (deckId: string, card: PokemonCard) => 'added' | 'max-reached'
  removeCardFromDeck: (deckId: string, cardId: string) => void
  setCardQuantity: (deckId: string, cardId: string, quantity: number) => void
  importDeck: (deck: Deck) => Deck
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: {},

      createDeck: (input) => {
        const now = new Date().toISOString()
        const deck: Deck = {
          id: generateId(),
          name: input.name,
          description: input.description,
          format: input.format,
          coverImage: input.coverImage,
          color: input.color,
          tags: input.tags,
          cards: [],
          createdAt: now,
          updatedAt: now,
          archived: false,
          favorite: false,
          comments: [],
          timesOpened: 0,
        }
        set((state) => ({ decks: { ...state.decks, [deck.id]: deck } }))
        return deck
      },

      updateDeck: (id, changes) =>
        set((state) => {
          const deck = state.decks[id]
          if (!deck) return state
          return {
            decks: {
              ...state.decks,
              [id]: { ...deck, ...changes, updatedAt: new Date().toISOString() },
            },
          }
        }),

      deleteDeck: (id) =>
        set((state) => {
          const next = { ...state.decks }
          delete next[id]
          return { decks: next }
        }),

      duplicateDeck: (id) => {
        const original = get().decks[id]
        if (!original) return undefined
        const now = new Date().toISOString()
        const copy: Deck = {
          ...original,
          id: generateId(),
          name: `${original.name} (cópia)`,
          createdAt: now,
          updatedAt: now,
          favorite: false,
          timesOpened: 0,
          comments: [],
        }
        set((state) => ({ decks: { ...state.decks, [copy.id]: copy } }))
        return copy
      },

      toggleFavoriteDeck: (id) =>
        set((state) => {
          const deck = state.decks[id]
          if (!deck) return state
          return { decks: { ...state.decks, [id]: { ...deck, favorite: !deck.favorite } } }
        }),

      toggleArchiveDeck: (id) =>
        set((state) => {
          const deck = state.decks[id]
          if (!deck) return state
          return { decks: { ...state.decks, [id]: { ...deck, archived: !deck.archived } } }
        }),

      registerOpen: (id) =>
        set((state) => {
          const deck = state.decks[id]
          if (!deck) return state
          return { decks: { ...state.decks, [id]: { ...deck, timesOpened: deck.timesOpened + 1 } } }
        }),

      addComment: (id, text) =>
        set((state) => {
          const deck = state.decks[id]
          if (!deck || !text.trim()) return state
          const comment = { id: generateId(), text: text.trim(), createdAt: new Date().toISOString() }
          return {
            decks: { ...state.decks, [id]: { ...deck, comments: [...deck.comments, comment] } },
          }
        }),

      removeComment: (id, commentId) =>
        set((state) => {
          const deck = state.decks[id]
          if (!deck) return state
          return {
            decks: {
              ...state.decks,
              [id]: { ...deck, comments: deck.comments.filter((c) => c.id !== commentId) },
            },
          }
        }),

      addCardToDeck: (deckId, card) => {
        const deck = get().decks[deckId]
        if (!deck) return 'max-reached'
        const existing = deck.cards.find((entry) => entry.card.id === card.id)
        const max = maxCopiesAllowed(deck.format, card.supertype, card.subtypes)
        const currentQty = existing?.quantity ?? 0
        if (currentQty >= max) return 'max-reached'

        set((state) => {
          const target = state.decks[deckId]
          if (!target) return state
          const nextCards = existing
            ? target.cards.map((entry) =>
                entry.card.id === card.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
              )
            : [...target.cards, { card, quantity: 1 }]
          return {
            decks: {
              ...state.decks,
              [deckId]: { ...target, cards: nextCards, updatedAt: new Date().toISOString() },
            },
          }
        })
        return 'added'
      },

      removeCardFromDeck: (deckId, cardId) =>
        set((state) => {
          const deck = state.decks[deckId]
          if (!deck) return state
          return {
            decks: {
              ...state.decks,
              [deckId]: {
                ...deck,
                cards: deck.cards.filter((entry) => entry.card.id !== cardId),
                updatedAt: new Date().toISOString(),
              },
            },
          }
        }),

      setCardQuantity: (deckId, cardId, quantity) =>
        set((state) => {
          const deck = state.decks[deckId]
          if (!deck) return state
          if (quantity <= 0) {
            return {
              decks: {
                ...state.decks,
                [deckId]: {
                  ...deck,
                  cards: deck.cards.filter((entry) => entry.card.id !== cardId),
                  updatedAt: new Date().toISOString(),
                },
              },
            }
          }
          const entry = deck.cards.find((e) => e.card.id === cardId)
          if (!entry) return state
          const max = maxCopiesAllowed(deck.format, entry.card.supertype, entry.card.subtypes)
          const clamped = Math.min(quantity, max === Infinity ? quantity : max)
          return {
            decks: {
              ...state.decks,
              [deckId]: {
                ...deck,
                cards: deck.cards.map((e) =>
                  e.card.id === cardId ? { ...e, quantity: clamped } : e,
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          }
        }),

      importDeck: (deck) => {
        const now = new Date().toISOString()
        const imported: Deck = {
          ...deck,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          archived: false,
        }
        set((state) => ({ decks: { ...state.decks, [imported.id]: imported } }))
        return imported
      },
    }),
    { name: 'pokedeck-decks' },
  ),
)
