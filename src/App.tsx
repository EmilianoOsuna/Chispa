import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useMembership, useSession } from './lib/queries'
import { useCoupleRealtime } from './lib/realtime'
import { dismiss, useToasts } from './lib/toast'
import { TabBar } from './components/TabBar'
import { Flame } from './components/Flame'
import { UpdatePrompt } from './components/UpdatePrompt'
import Login from './screens/Login'
import Onboarding from './screens/Onboarding'
import Today from './screens/Today'
import StreakForm from './screens/StreakForm'
import Danger from './screens/Danger'
import Celebration from './screens/Celebration'
import Us from './screens/Us'
import Achievements from './screens/Achievements'
import Profile from './screens/Profile'

const WEEK = 1000 * 60 * 60 * 24 * 7
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, gcTime: WEEK, retry: 1, networkMode: 'offlineFirst' } },
})
const persister = createSyncStoragePersister({ storage: window.localStorage, key: 'chispa-cache' })

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: WEEK }}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Shell />
          <Toasts />
          <UpdatePrompt />
        </BrowserRouter>
      </MotionConfig>
    </PersistQueryClientProvider>
  )
}

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <Flame mood="idle" width={84} />
    </div>
  )
}

function Shell() {
  const session = useSession()
  const membership = useMembership(session?.user.id)
  if (session === undefined) return <Splash />
  if (!session) return <Login />
  if (membership.isPending) return <Splash />
  const m = membership.data
  // no espera a la pareja: con ser miembro ya se usa la app
  if (!m?.profile || !m.member) return <Onboarding userId={session.user.id} profile={m?.profile ?? null} />
  return <Main coupleId={m.member.couple_id} />
}

const FULLSCREEN = /^\/(racha|celebracion)/

function Main({ coupleId }: { coupleId: string }) {
  useCoupleRealtime(coupleId)
  const location = useLocation()
  const full = FULLSCREEN.test(location.pathname)
  return (
    <div className="relative mx-auto min-h-dvh max-w-[430px]">
      <OfflineBanner />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname}
          initial={{ opacity: 0, y: full ? 24 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: full ? 24 : -8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}>
          <Routes location={location}>
            <Route path="/" element={<Today />} />
            <Route path="/nosotros" element={<Us />} />
            <Route path="/logros" element={<Achievements />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/racha/nueva" element={<StreakForm />} />
            <Route path="/racha/:id/editar" element={<StreakForm />} />
            <Route path="/racha/:id/peligro" element={<Danger />} />
            <Route path="/celebracion" element={<Celebration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {!full && <TabBar />}
    </div>
  )
}

function useOnline() {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const up = () => setOn(true), down = () => setOn(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])
  return on
}

function OfflineBanner() {
  const online = useOnline()
  return (
    <AnimatePresence>
      {!online && (
        <motion.div role="status" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
          className="overflow-hidden bg-ink text-center text-[13px] font-bold text-mist">
          <div className="py-1.5">Sin conexión · mostrando lo último que vimos</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Toasts() {
  const items = useToasts()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(12px,env(safe-area-inset-top))] z-50 mx-auto flex max-w-[430px] flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`${t.action ? 'pointer-events-auto' : ''} flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-[15px] font-bold text-white shadow-[0_5px_0_#0A1328]`}>
            <span>{t.text}</span>
            {t.action && (
              <button type="button" onClick={() => { t.action!.run(); dismiss(t.id) }}
                className="min-h-11 rounded-xl bg-flame px-3 font-extrabold text-ink">{t.action.label}</button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
