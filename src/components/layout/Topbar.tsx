import { Search, Sparkles } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface TopbarProps {
  onOpenSearch: () => void
}

export function Topbar({ onOpenSearch }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="font-display text-base font-bold text-slate-900 dark:text-white">PokéDeck</span>
      </div>

      <button
        onClick={onOpenSearch}
        className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-400 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 sm:max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Pesquisar cartas...</span>
        <span className="sm:hidden">Pesquisar...</span>
        <kbd className="ml-auto hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 sm:block">
          Ctrl K
        </kbd>
      </button>

      <ThemeToggle />
    </header>
  )
}
