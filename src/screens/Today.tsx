import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  dangerStreak, errorMessage, pairDone, periodDone, summarize, useCheckIn, useNudge, useToday,
  type Streak, type Today as TodayData,
} from '../lib/queries'
import { addDays, isoDow, splitMs } from '../lib/time'
import { toast } from '../lib/toast'
import { Avatar, Count, Week, weekCells } from '../components/bits'
import { Flame } from '../components/Flame'
import { Icon } from '../components/Icon'
import { StreakRow } from '../components/StreakRow'
import { InviteCard } from '../components/InviteCard'

export function useTick(ms: number) {
  const [, set] = useState(0)
  useEffect(() => { const id = setInterval(() => set((n) => n + 1), ms); return () => clearInterval(id) }, [ms])
}

export const dangerKey = (id: string, date: string) => `chispa:peligro:${id}:${date}`

/** Al marcar: ¿este check-in completa la racha de la pareja en el periodo? */
export function completesPair(s: Streak, t: TodayData) {
  const partner = t.members.find((m) => m.user_id !== t.me)
  if (!partner || !periodDone(s, partner.user_id)) return false
  return s.frequency === 'weekly' ? (s.week_count[t.me] ?? 0) + 1 >= (s.weekly_target ?? 1) : true
}

export default function Today() {
  const { data: t } = useToday()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const checkIn = useCheckIn()
  const nudge = useNudge()
  useTick(30_000)

  // Racha en peligro: al abrir (una vez por racha y día) o desde una notificación (?streak=)
  useEffect(() => {
    if (!t) return
    const fromPush = params.get('streak')
    const s = fromPush ? t.streaks.find((x) => x.id === fromPush && !periodDone(x, t.me) && x.due_today) : dangerStreak(t)
    if (!s) return
    if (!fromPush && localStorage.getItem(dangerKey(s.id, t.today))) return
    navigate(`/racha/${s.id}/peligro`)
  }, [t, params, navigate])

  if (!t) return <div className="flex min-h-dvh items-center justify-center"><Flame mood="idle" /></div>
  const sum = summarize(t)
  const weekStart = addDays(t.today, 1 - isoDow(t.today))
  const left = splitMs(sum.msToClose)
  const sorted = [...t.streaks].sort((a, b) => Number(b.due_today) - Number(a.due_today))

  function toggle(s: Streak) {
    const undo = !!s.done[t!.me]
    const celebrate = !undo && completesPair(s, t!)
    checkIn.mutate({ streakId: s.id, undo, userId: t!.me }, {
      onSuccess: () => { if (celebrate) navigate('/celebracion', { state: { streakId: s.id } }) },
      onError: (e) => toast(errorMessage(e)),
    })
  }

  function poke(s: Streak) {
    nudge.mutate({ streakId: s.id }, {
      onSuccess: () => toast(`Le mandaste un toque a ${sum.partner?.name}`),
      onError: (e) => toast(errorMessage(e)),
    })
  }

  return (
    <main className="flex flex-col gap-3.5 px-[18px] pt-[18px] pb-32">
      <header className="flex h-11 items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame mood="logo" width={26} />
          <span className="font-display text-[26px] font-extrabold tracking-[-0.5px]">chispa</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-full border-2 border-line bg-white py-1 pr-2.5 pl-1.5 text-sm font-extrabold" aria-label={`${t.sparks} chispas`}>
            <span className="text-sky"><Icon name="spark" size={18} stroke={2.4} /></span>
            <Count value={t.sparks} />
          </div>
          <div className="flex" aria-label={t.members.map((m) => m.name).join(' y ')}>
            {t.members.map((m, i) => <Avatar key={m.user_id} {...m} className={i ? '-ml-2.5' : ''} />)}
          </div>
        </div>
      </header>

      {t.members.length < 2 && <InviteCard code={t.couple.invite_code} userId={t.me} />}

      <section className="shadow-solid flex flex-col gap-4 rounded-[28px] bg-ink px-5 pt-5 pb-[18px] text-white [--press-c:var(--color-ink-deep)] [--press-d:6px]">
        <div className="flex items-center gap-4">
          <Flame mood="idle" width={84} />
          <div className="flex flex-col gap-0.5">
            <Count value={sum.coupleStreak} className="font-display text-[64px] leading-[0.95] font-extrabold tracking-[-2px] text-flame-light" />
            <div className="text-[17px] font-extrabold">{sum.coupleStreak === 1 ? 'día' : 'días'} en pareja</div>
            <div className="text-[13px] font-semibold text-mist">
              Mejor racha: {sum.best}
              {sum.best > sum.coupleStreak && ` · faltan ${sum.best - sum.coupleStreak + 1} para superarla`}
              {sum.best === sum.coupleStreak && sum.best > 0 && ' · ¡es su récord!'}
            </div>
          </div>
        </div>
        <Week cells={weekCells(t.today, t.week, sum.todayPerfect, weekStart)} />
      </section>

      <AnimatePresence initial={false}>
        {sum.pending.length > 0 && sum.msToClose > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div role="status" className="flex items-center gap-2.5 rounded-2xl border-2 border-peach-line bg-peach px-3.5 py-2.5">
              <span className="text-flame-clock"><Icon name="clock" size={22} stroke={2.4} /></span>
              <span className="text-sm font-bold text-ember">
                El día cierra en <b className="font-extrabold">{left.h ? `${left.h} h ` : ''}{left.m} min</b> · faltan {sum.pending.length} de {sum.required.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-extrabold">Rachas de hoy</h2>
        <Link to="/racha/nueva" aria-label="Nueva racha"
          className="press [--press-c:var(--color-sky-deep)] flex size-11 items-center justify-center rounded-[14px] bg-sky text-white">
          <Icon name="plus" size={20} stroke={3} />
        </Link>
      </div>

      {t.streaks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[22px] border-2 border-dashed border-mist bg-white px-6 py-8 text-center">
          <Flame mood="idle" width={64} />
          <p className="font-display text-xl font-extrabold">Todavía no hay rachas</p>
          <p className="text-[15px] font-semibold text-muted">Elijan algo que quieran hacer juntos todos los días.</p>
          <Link to="/racha/nueva"
            className="press [--press-c:var(--color-flame-deep)] [--press-d:5px] mt-1 flex h-[52px] items-center rounded-[18px] bg-flame px-6 font-extrabold uppercase text-ink no-underline">
            Encender la primera
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {sorted.map((s, i) => {
              const partner = sum.partner
              const canPoke = !!partner && s.due_today && !s.protected && !pairDone(s, t) && !periodDone(s, partner.user_id)
              return (
                <StreakRow key={s.id} s={s} t={t} index={i} busy={checkIn.isPending}
                  onToggle={() => toggle(s)} onOpen={() => navigate(`/racha/${s.id}/editar`)}
                  onNudge={canPoke ? () => poke(s) : undefined} />
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </main>
  )
}
