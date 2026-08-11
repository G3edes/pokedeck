import { NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PRIMARY_NAV, SECONDARY_NAV } from './navigation'
import { cn } from '@/lib/cn'
import { useUserStore } from '@/store/useUserStore'
import { useDeckStore } from '@/store/useDeckStore'

export function Sidebar() {
  const profile = useUserStore((s) => s.profile)
  const deckCount = useDeckStore((s) => Object.keys(s.decks).length)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-100 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none text-slate-900 dark:text-white">
            PokéDeck
          </p>
          <p className="text-[11px] text-slate-400">Deck Builder &amp; Collection</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin px-3">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
            {item.to === '/decks' && deckCount > 0 && (
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {deckCount}
              </span>
            )}
          </NavLink>
        ))}

        <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

        {SECONDARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <img src={profile.avatar} alt={profile.name} className="h-9 w-9 rounded-full bg-white object-contain" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{profile.name}</p>
          <p className="truncate text-xs text-slate-400">Ver perfil</p>
        </div>
      </NavLink>
    </aside>
  )
}
