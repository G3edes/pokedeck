import { Moon, Sun, SunMoon } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/store/useThemeStore'
import { cn } from '@/lib/cn'

const OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Claro' },
  { mode: 'system', icon: SunMoon, label: 'Sistema' },
  { mode: 'dark', icon: Moon, label: 'Escuro' },
]

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  return (
    <div className="flex items-center rounded-full bg-slate-100 p-1 dark:bg-slate-800">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          onClick={() => setMode(option.mode)}
          title={option.label}
          aria-label={option.label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full transition-all',
            mode === option.mode
              ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-950 dark:text-brand-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
          )}
        >
          <option.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}
