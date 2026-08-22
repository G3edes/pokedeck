import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageLoader } from '@/components/ui/PageLoader'

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const CardsExplorer = lazy(() => import('@/pages/CardsExplorer').then((m) => ({ default: m.CardsExplorer })))
const CardDetails = lazy(() => import('@/pages/CardDetails').then((m) => ({ default: m.CardDetails })))
const Decks = lazy(() => import('@/pages/Decks').then((m) => ({ default: m.Decks })))
const DeckNew = lazy(() => import('@/pages/DeckNew').then((m) => ({ default: m.DeckNew })))
const DeckView = lazy(() => import('@/pages/DeckView').then((m) => ({ default: m.DeckView })))
const DeckEdit = lazy(() => import('@/pages/DeckEdit').then((m) => ({ default: m.DeckEdit })))
const Collection = lazy(() => import('@/pages/Collection').then((m) => ({ default: m.Collection })))
const Favorites = lazy(() => import('@/pages/Favorites').then((m) => ({ default: m.Favorites })))
const Wishlist = lazy(() => import('@/pages/Wishlist').then((m) => ({ default: m.Wishlist })))
const Compare = lazy(() => import('@/pages/Compare').then((m) => ({ default: m.Compare })))
const Statistics = lazy(() => import('@/pages/Statistics').then((m) => ({ default: m.Statistics })))
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))
const SharedDeck = lazy(() => import('@/pages/SharedDeck').then((m) => ({ default: m.SharedDeck })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/decks/shared/:shareId" element={<SharedDeck />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cards" element={<CardsExplorer />} />
            <Route path="/cards/:id" element={<CardDetails />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/decks/new" element={<DeckNew />} />
            <Route path="/decks/:id" element={<DeckView />} />
            <Route path="/decks/:id/edit" element={<DeckEdit />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
