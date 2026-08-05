import type { PokemonCard } from './pokemon'

export type CardCondition =
  | 'Mint'
  | 'Near Mint'
  | 'Excellent'
  | 'Good'
  | 'Played'
  | 'Poor'

export const CARD_CONDITIONS: CardCondition[] = [
  'Mint',
  'Near Mint',
  'Excellent',
  'Good',
  'Played',
  'Poor',
]

export type OwnershipStatus = 'owned' | 'wanted' | 'duplicate'

export interface CollectionEntry {
  cardId: string
  card: PokemonCard
  status: OwnershipStatus
  quantity: number
  duplicates: number
  condition: CardCondition
  note: string
  addedAt: string
}

export type WishlistPriority = 'low' | 'medium' | 'high'

export type WishlistStatus = 'wanted' | 'found' | 'purchased'

export interface WishlistEntry {
  cardId: string
  card: PokemonCard
  priority: WishlistPriority
  note: string
  desiredPrice?: number
  status: WishlistStatus
  addedAt: string
}

export interface FavoriteFolder {
  id: string
  name: string
  createdAt: string
}

export interface FavoriteEntry {
  cardId: string
  card: PokemonCard
  folderIds: string[]
  note: string
  addedAt: string
}
