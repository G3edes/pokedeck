import {
  BarChart3,
  LayoutDashboard,
  Layers,
  Library,
  Heart,
  ListChecks,
  Scale,
  Settings,
  Sparkles,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cards', label: 'Explorar Cartas', icon: Sparkles },
  { to: '/decks', label: 'Meus Decks', icon: Layers },
  { to: '/collection', label: 'Coleção', icon: Library },
]

export const SECONDARY_NAV: NavItem[] = [
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/wishlist', label: 'Lista de Desejos', icon: ListChecks },
  { to: '/compare', label: 'Comparar', icon: Scale },
  { to: '/statistics', label: 'Estatísticas', icon: BarChart3 },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV]
