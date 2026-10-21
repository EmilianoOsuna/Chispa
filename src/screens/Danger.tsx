import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { motion } from 'motion/react'
import { errorMessage, periodDone, useCheckIn, useFreeze, useToday, type Streak } from '../lib/queries'
import { msUntilMidnight, pad, splitMs } from '../lib/time'
import { toast } from '../lib/toast'
import { Flame } from '../components/Flame'
import { Icon } from '../components/Icon'
import { Avatar } from '../components/bits'
import { dangerKey, useTick } from './Today'

const DONE_LABEL: Record<Streak['icon'], string> = {
  agua: 'Ya tomé agua', ejercicio: 'Ya hice ejercicio', dormir: 'Ya cumplí', leer: 'Ya leí', meditar: 'Ya medité', comer: 'Ya comí sano',
}
const PARTNER_DID: Record<Streak['icon'], string> = {
  agua: 'ya tomó su agua', ejercicio: 'ya hizo su ejercicio', dormir: 'ya cumplió', leer: 'ya leyó', meditar: 'ya meditó', comer: 'ya comió sano',
}

export default function Danger() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: t } = useToday()
  const checkIn = useCheckIn()
  const freeze = useFreeze()
  useTick(1000)
  const s = t?.streaks.find((x) => x.id === id)

  useEffect(() => { if (t && s) localStorage.setItem(dangerKey(s.id, t.today), '1') }, [t, s])

  if (!t || !s) return <Navigate to="/" replace />
  const me = t.members.find((m) => m.user_id === t.me)!
  const partner = t.members.find((m) => m.user_id !== t.me)!
  const acting = checkIn.isPending || checkIn.isSuccess || freeze.isPending || freeze.isSuccess
  if (!acting && (periodDone(s, t.me) || s.protected)) return <Navigate to="/" replace />

  const ms = msUntilMidnight(t.timezone)
  const { h, m, s: sec } = splitMs(ms)
  const closed = ms <= 0
  const atStake = s.counters[t.me]?.current ?? 0
  const partnerDone = periodDone(s, partner.user_id)
  const nudge = t.last_nudge && t.last_nudge.from_user === partner.user_id && t.last_nudge.kind === 'nudge' ? t.last_nudge : null
  const toNext = 7 - (t.closed_streak % 7)

  function done() {
    checkIn.mutate({ streakId: s!.id, undo: false, userId: t!.me }, {
      onSuccess: () => navigate(partnerDone ? '/celebracion' : '/', { replace: true, state: { streakId: s!.id } }),
      onError: (e) => toast(errorMessage(e)),
    })
  }
  function protect() {
    freeze.mutate(s!.id, {
      onSuccess: () => { toast('Racha protegida por hoy'); navigate('/', { replace: true }) },
      onError: (e) => toast(errorMessage(e)),
    })
  }

  return (
    <main className="flex min-h-dvh flex-col gap-[18px] bg-ink px-[22px] pt-6 pb-[30px] text-white">
      <div className="flex items-center justify-between">
        <Link to="/" replace aria-label="Cerrar" className="flex size-11 items-center justify-center rounded-[14px] bg-navy text-mist">
          <Icon name="close" size={20} stroke={2.6} />
        </Link>
        <span className="rounded-full bg-flame px-3 py-1.5 text-[13px] font-extrabold tracking-[1px] text-ink uppercase">Racha en peligro</span>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2">
        <Flame mood="scared" width={120} />
        <h1 className="m-0 text-center font-display text-[30px] leading-[1.1] font-extrabold">¡No dejes que se apague!</h1>
        <p className="m-0 max-w-[300px] text-center text-base leading-[1.4] font-semibold text-mist">
          {partnerDone ? `${partner.name} ${PARTNER_DID[s.icon]}. ` : ''}Falta lo tuyo para salvar{' '}
          <b className="font-extrabold text-flame-light">{atStake} {atStake === 1 ? 'día' : 'días'}</b> juntos.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2" role="timer" aria-label={`Quedan ${h} horas ${m} minutos`}>
        {[[h, 'horas'], [m, 'minutos'], [sec, 'segundos']].map(([v, label]) => (
          <div key={label} className="flex flex-col items-center rounded-[18px] bg-navy py-3">
            <motion.span key={String(v)} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}
              className="font-display text-[40px] leading-none font-extrabold text-flame-light">{pad(Number(v))}</motion.span>
            <span className="text-xs font-bold text-mist">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-[18px] border-2 border-navy-line bg-navy-card px-3 py-2.5">
          <Avatar {...partner} size={38} ring="#1B2A4E" />
          <div className="flex-1 text-[15px] font-bold">{partner.name} · {partnerDone ? s.name : 'pendiente'}</div>
          {partnerDone && <span className="text-sky-pale" role="img" aria-label="Completado"><Icon name="check" size={24} stroke={3} /></span>}
        </div>
        <div className="pulso flex items-center gap-3 rounded-[18px] border-2 border-flame bg-navy-card px-3 py-2.5">
          <Avatar {...me} size={38} ring="#1B2A4E" />
          <div className="flex-1 text-[15px] font-bold">{me.name} · pendiente</div>
          <span className="text-flame-light" role="img" aria-label="Pendiente"><Icon name="pending" size={24} stroke={2.6} /></span>
        </div>
        {nudge && (
          <motion.div initial={{ opacity: 0, x: -20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.3 }}
            className="max-w-[270px] self-start rounded-[18px_18px_18px_6px] bg-sky px-3.5 py-2.5 text-[15px] leading-[1.35] font-semibold">
            <div className="mb-0.5 text-xs font-extrabold text-sky-soft">{partner.name} te mandó un toque</div>
            {nudge.body ?? '¡Tú puedes!'}
          </motion.div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-3">
        <button type="button" onClick={done} disabled={closed || checkIn.isPending}
          className="press [--press-c:var(--color-flame-deep)] [--press-d:5px] flex h-[58px] items-center justify-center rounded-[18px] bg-flame text-lg font-extrabold tracking-[0.5px] text-ink uppercase disabled:opacity-60">
          {closed ? 'El día ya cerró' : DONE_LABEL[s.icon]}
        </button>
        <button type="button" onClick={protect} disabled={closed || t.couple.freezes < 1 || freeze.isPending}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-[18px] border-2 border-navy-line px-3 text-[15px] font-extrabold text-sky-soft disabled:opacity-60">
          <span className="text-sky-pale"><Icon name="shield" size={20} stroke={2.4} /></span>
          {t.couple.freezes > 0
            ? `Usar protector de racha · ${t.couple.freezes} ${t.couple.freezes === 1 ? 'disponible' : 'disponibles'}`
            : `Sin protectores · faltan ${toNext} días perfectos`}
        </button>
      </div>
    </main>
  )
}
