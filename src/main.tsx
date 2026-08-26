import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from '@/store/useThemeStore'
import { ApiError } from '@/api/client'

useThemeStore.getState().applyTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The Pokémon TCG API's free tier is prone to intermittent 5xx errors
      // and rate limiting, so transient failures get a few retries with
      // exponential backoff before surfacing an error to the user.
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false
        if (error instanceof ApiError && error.status && error.status < 500 && error.status !== 429) {
          return false
        }
        return true
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
