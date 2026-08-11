import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Clock, CornerDownLeft, Search } from 'lucide-react'
import { ALL_NAV } from './navigation'
import { useHistoryStore } from '@/store/useHistoryStore'
import { cn } from '@/lib/cn'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [term, setTerm] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const recentSearches = useHistoryStore((s) => s.recentSearches)
  const addSearch = useHistoryStore((s) => s.addSearch)

  useEffect(() => {
    if (open) {
      setTerm('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const pageResults = useMemo(
    () => ALL_NAV.filter((item) => item.label.toLowerCase().includes(term.toLowerCase())),
    [term],
  )

  const searchAction = term.trim()
    ? [{ label: `Pesquisar cartas por "${term.trim()}"`, to: `/cards?q=${encodeURIComponent(term.trim())}` }]
    : []

  const results = [...searchAction, ...pageResults.map((p) => ({ label: p.label, to: p.to }))]

  function go(to: string) {
    if (to.startsWith('/cards?q=')) addSearch(term.trim())
    navigate(to)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        const chosen = results[activeIndex]
        if (chosen) go(chosen.to)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, activeIndex])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 sm:pt-32">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-4.5 w-4 text-slate-400" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => {
              setTerm(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Pesquisar cartas, páginas..."
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400">Nenhum resultado encontrado.</p>
          )}
          {results.map((item, index) => (
            <button
              key={item.to + item.label}
              onClick={() => go(item.to)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                index === activeIndex
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300',
              )}
            >
              {item.label}
              {index === activeIndex && <CornerDownLeft className="h-3.5 w-3.5" />}
            </button>
          ))}

          {term === '' && recentSearches.length > 0 && (
            <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800">
              <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                Pesquisas recentes
              </p>
              {recentSearches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => go(`/cards?q=${encodeURIComponent(search.term)}`)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {search.term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
