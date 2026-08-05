export interface UserProfile {
  name: string
  avatar: string
  bio: string
  createdAt: string
  language: 'pt-BR' | 'en-US'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface RecentSearch {
  id: string
  term: string
  searchedAt: string
}

export interface RecentlyViewedCard {
  cardId: string
  viewedAt: string
}
