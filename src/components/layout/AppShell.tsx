import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Topbar } from './Topbar'
import { CommandPalette } from './CommandPalette'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  useKeyboardShortcuts({
    'ctrl+k': () => setSearchOpen(true),
    escape: () => setSearchOpen(false),
    n: () => navigate('/decks/new'),
    f: () => navigate('/favorites'),
    d: () => navigate('/decks'),
  })

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ToastContainer />
    </div>
  )
}
