import type { PokemonCard } from './pokemon'

export type DeckFormat = 'Standard' | 'Expanded' | 'Unlimited' | 'GLC' | 'Casual'

export const DECK_FORMATS: DeckFormat[] = [
  'Standard',
  'Expanded',
  'Unlimited',
  'GLC',
  'Casual',
]

export const DECK_COLORS = [
  { id: 'brand', label: 'Índigo', value: '#4a5cf7' },
  { id: 'ember', label: 'Brasa', value: '#fd4d0d' },
  { id: 'leaf', label: 'Folha', value: '#22a058' },
  { id: 'violet', label: 'Violeta', value: '#a855f7' },
  { id: 'amber', label: 'Âmbar', value: '#f59e0b' },
  { id: 'rose', label: 'Rosa', value: '#f43f5e' },
  { id: 'slate', label: 'Grafite', value: '#475569' },
] as const

export interface DeckCardEntry {
  card: PokemonCard
  quantity: number
}

export interface DeckComment {
  id: string
  text: string
  createdAt: string
}

export interface Deck {
  id: string
  name: string
  description: string
  format: DeckFormat
  coverImage?: string
  color: string
  tags: string[]
  cards: DeckCardEntry[]
  createdAt: string
  updatedAt: string
  archived: boolean
  favorite: boolean
  comments: DeckComment[]
  timesOpened: number
}

export interface DeckCategoryCounts {
  pokemon: number
  trainer: number
  energy: number
  total: number
}

export interface DeckAnalysis {
  categoryCounts: DeckCategoryCounts
  typeDistribution: Record<string, number>
  rarityDistribution: Record<string, number>
  energyDistribution: Record<string, number>
  retreatCurve: Record<number, number>
  averageHp: number
  averageConvertedRetreatCost: number
  score: number
  scoreBreakdown: { label: string; points: number; max: number }[]
  recommendations: string[]
}

export interface SharedDeckSnapshot {
  id: string
  deck: Deck
  ownerName: string
  sharedAt: string
}
