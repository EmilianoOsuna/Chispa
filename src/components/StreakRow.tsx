import { motion } from 'motion/react'
import type { Streak, Today } from '../lib/queries'
import { pairDone, periodDone, streakCount } from '../lib/queries'
import { PersonDot } from './bits'
import { Icon } from './Icon'

const VERB: Record<Streak['icon'], string> = {
  agua: 'tomó agua', ejercicio: 'hizo ejercicio', dormir: 'cumplió', leer: 'leyó', meditar: 'meditó', comer: 'comió sano',
}
const BLUE_TILE = new Set<Streak['icon']>(['dormir', 'agua', 'meditar'])

function subtitle(s: Streak, t: Today) {
  const partner = t.members.find((m) => m.user_id !== t.me)
  const count = streakCount(s, t, t.me)
  const unit = s.frequency === 'weekly' ? (count === 1 ? 'semana' : 'semanas') : count === 1 ? 'día' : 'días'
  const head = `${count} ${unit}`
  if (!s.due_today) return `${head} · no toca hoy`
  if (s.protected) return `${head} · protegida hoy`
  if (pairDone(s, t)) return `${head} · ${s.frequency === 'weekly' ? '¡meta semanal cumplida!' : '¡completada hoy!'}`
  const mine = periodDone(s, t.me)
  const theirs = partner ? periodDone(s, partner.user_id) : false
  if (theirs && !mine) return `${head} · ${partner!.name} ya ${VERB[s.icon]}`
  if (partner && partner.today > t.today) return `${head} · ${partner.name} ya va en mañana`
  if (mine && partner) return `${head} · falta ${partner.name}`
  if (s.frequency === 'weekly') return `${head} · ${s.week_count[t.me] ?? 0}/${s.weekly_target} esta semana`
  if (s.icon === 'dormir') return `${head} · se marca esta noche`
  return `${head} · pendiente`
}

export function StreakRow({ s, t, index, onToggle, onOpen, onNudge, busy }: {
  s: Streak; t: Today; index: number; busy: boolean
  onToggle: () => void; onOpen: () => void; onNudge?: () => void
}) {
  const blue = BLUE_TILE.has(s.icon)
  return (
    <motion.li layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30, delay: index * 0.05 }}
      className="shadow-solid flex items-center gap-3 rounded-[20px] border-2 border-line bg-white py-3 pr-3.5 pl-3.5">
      <button type="button" onClick={onOpen} aria-label={`Editar ${s.name}`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className={`flex size-12 flex-none items-center justify-center rounded-[14px] ${blue ? 'bg-sky-soft text-sky-ink' : 'bg-peach text-flame-deep'}`}>
          <Icon name={s.icon} size={26} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-extrabold">{s.name}</span>
          <span className="block truncate text-[13px] font-semibold text-muted">{subtitle(s, t)}</span>
        </span>
      </button>
      {onNudge && (
        <button type="button" onClick={onNudge} aria-label="Mandar un toque"
          className="-my-2 flex size-11 flex-none items-center justify-center rounded-full text-sky-ink active:scale-90">
          <Icon name="hand" size={20} />
        </button>
      )}
      <div className="flex gap-1.5">
        {t.members.map((m) => { // el servidor los ordena: flame, sky
          const done = periodDone(s, m.user_id)
          const mine = m.user_id === t.me
          const ahead = !mine && m.today > t.today ? ' (ya va en mañana)' : ''
          const label = `${mine ? 'Tú' : m.name}: ${done ? 'completó' : 'pendiente'}${ahead}`
          return (
            <PersonDot key={m.user_id} color={m.color} done={done} label={label}
              onToggle={mine && s.due_today ? onToggle : undefined} disabled={busy} />
          )
        })}
      </div>
    </motion.li>
  )
}
