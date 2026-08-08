import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  applyTheme: () => void
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return mode === 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => {
        set({ mode })
        get().applyTheme()
      },
      applyTheme: () => {
        const isDark = resolveIsDark(get().mode)
        document.documentElement.classList.toggle('dark', isDark)
      },
    }),
    {
      name: 'pokedeck-theme',
      onRehydrateStorage: () => (state) => {
        state?.applyTheme()
      },
    },
  ),
)

if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (useThemeStore.getState().mode === 'system') {
        useThemeStore.getState().applyTheme()
      }
    })
}
