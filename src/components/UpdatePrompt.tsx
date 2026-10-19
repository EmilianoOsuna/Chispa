import { useRegisterSW } from 'virtual:pwa-register/react'
import { AnimatePresence, motion } from 'motion/react'

export function UpdatePrompt() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()
  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div role="status" initial={{ y: -80 }} animate={{ y: 0 }} exit={{ y: -80 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="fixed inset-x-0 top-3 z-50 mx-auto flex w-[calc(100%-32px)] max-w-[398px] items-center gap-3 rounded-2xl bg-ink px-4 py-2.5 text-[15px] font-bold text-white shadow-[0_5px_0_#0A1328]">
          <span className="flex-1">Nueva versión disponible</span>
          <button type="button" onClick={() => setNeedRefresh(false)} className="min-h-11 px-2 text-mist">Luego</button>
          <button type="button" onClick={() => updateServiceWorker(true)} className="min-h-11 rounded-xl bg-flame px-3 font-extrabold text-ink">Actualizar</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
