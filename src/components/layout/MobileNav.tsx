import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { PRIMARY_NAV, SECONDARY_NAV } from './navigation'
import { Drawer } from '@/components/ui/Drawer'
import { cn } from '@/lib/cn'

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-slate-100 bg-white/95 px-2 py-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-slate-400"
        >
          <Menu className="h-5 w-5" />
          Mais
        </button>
      </nav>

      <Drawer open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu" side="bottom">
        <div className="grid grid-cols-3 gap-3 pb-4">
          {SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-xs font-semibold transition',
                  isActive
                    ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </Drawer>
    </>
  )
}
