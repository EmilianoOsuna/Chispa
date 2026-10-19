import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { errorMessage, streakCount, useNudge, useToday, type Streak } from '../lib/queries'
import { addDays, DAYS, isoDow } from '../lib/time'
import { toast } from '../lib/toast'
import { Confetti, Count, Week, weekCells } from '../components/bits'
import { Flame } from '../components/Flame'
import { Icon } from '../components/Icon'

const PLURAL: Record<Streak['icon'], string> = {
  agua: 'tomaron agua', ejercicio: 'hicieron ejercicio', dormir: 'se durmieron a tiempo',
  leer: 'leyeron', meditar: 'meditaron', comer: 'comieron sano',
}

export default function Celebration() {
  const { state } = useLocation() as { state: { streakId?: string } | null }
  const navigate = useNavigate()
  const { data: t } = useToday()
  const nudge = useNudge()
  const [fived, setFived] = useState(false)
  const s = t?.streaks.find((x) => x.id === state?.streakId)
  if (!t || !s) return <Navigate to="/" replace />

  const me = t.members.find((m) => m.user_id === t.me)!
  const partner = t.members.find((m) => m.user_id !== t.me)!
  const count = streakCount(s, t, t.me)
  const weekStart = addDays(t.today, 1 - isoDow(t.today))
  const cells = weekCells(t.today, t.week, true, weekStart)
  const doneDays = cells.filter((c) => c.kind === 'done').length
  const dow = DAYS[new Date(`${t.today}T12:00:00Z`).getUTCDay()]

  function highFive() {
    nudge.mutate({ streakId: s!.id, kind: 'high_five' }, {
      onSuccess: () => { setFived(true); toast(`¡Chocaste las cinco con ${partner.name}!`) },
      onError: (e) => toast(errorMessage(e)),
    })
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-sky px-[22px] pt-7 pb-[30px] text-white">
      <Confetti />
      <div className="flex w-full items-center justify-between">
        <span className="text-[13px] font-extrabold tracking-[1.5px] text-sky-soft uppercase">{s.name} · {dow}</span>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.5 }}
          className="flex items-center gap-1 rounded-full bg-ink px-3 py-[5px] text-sm font-extrabold text-flame-light">+20 chispas</motion.span>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2.5">
        <motion.div initial={{ scale: 0.3, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className="relative flex h-[220px] w-[200px] items-end justify-center">
          <div aria-hidden="true" className="absolute bottom-0 h-6 w-[170px] rounded-[50%] bg-sky-deep" />
          <Flame mood="happy" width={170} />
        </motion.div>
        <Count value={count} className="font-display text-[120px] leading-[0.9] font-extrabold tracking-[-5px]" />
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="m-0 text-center font-display text-[30px] font-extrabold">¡Racha en pareja!</motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="m-0 max-w-[290px] text-center text-base leading-[1.4] font-semibold text-sky-mist">
          {me.name} y {partner.name} {PLURAL[s.icon]} hoy. La llama sigue viva un día más.
        </motion.p>
        <div className="mt-2.5 w-full rounded-[20px] bg-sky-deep p-3">
          <Week cells={cells} variant="blue" />
        </div>
        <div className="text-sm font-bold text-sky-soft">{doneDays === 7 ? 'Semana perfecta · 7 de 7' : `${doneDays} de 7 esta semana`}</div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <button type="button" onClick={() => navigate('/', { replace: true })}
          className="press [--press-c:var(--color-flame-deep)] [--press-d:5px] flex h-14 items-center justify-center rounded-[18px] bg-flame text-lg font-extrabold tracking-[0.5px] text-ink uppercase">
          Seguir
        </button>
        <button type="button" onClick={highFive} disabled={fived || nudge.isPending}
          className="flex h-[52px] items-center justify-center gap-2 rounded-[18px] border-2 border-sky-pale text-base font-extrabold text-white disabled:opacity-60">
          <Icon name="hand" size={20} stroke={2.4} />
          {fived ? '¡Chocaron las cinco!' : `Chocar las cinco con ${partner.name}`}
        </button>
      </div>
    </main>
  )
}
