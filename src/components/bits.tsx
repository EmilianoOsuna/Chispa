import { useEffect } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import type { Color, DayState } from '../lib/queries'
import { WEEK_LABELS } from '../lib/time'
import { Icon } from './Icon'
import { useAvatarUri, type AvatarStyle } from '../lib/avatar'

export const COLOR: Record<Color, { bg: string; on: string; deep: string }> = {
  flame: { bg: '#FF8A2A', on: '#14213D', deep: '#C2410C' },
  sky: { bg: '#2563EB', on: '#FFFFFF', deep: '#1A47B8' },
}

const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** Número que cuenta con resorte cuando cambia. */
export function Count({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion()
  const mv = useSpring(value, { stiffness: 140, damping: 22 })
  const text = useTransform(mv, (v) => group(Math.round(v)))
  useEffect(() => { if (reduce) mv.jump(value); else mv.set(value) }, [value, reduce, mv])
  return <motion.span className={className}>{text}</motion.span>
}

type AvatarProps = {
  name: string; color: Color; size?: number; ring?: string; className?: string
  avatar_style?: AvatarStyle | null; avatar_seed?: string | null
}

/** DiceBear si la persona eligió uno; si no, su inicial sobre su color. */
export function Avatar({ name, color, size = 34, ring = '#F3F5FA', className = '', avatar_style, avatar_seed }: AvatarProps) {
  const uri = useAvatarUri(avatar_style, avatar_seed || name, COLOR[color].bg)
  if (uri) {
    return (
      <img src={uri} alt="" aria-hidden="true" width={size} height={size}
        className={`flex-none rounded-full ${className}`} style={{ border: `3px solid ${ring}`, background: COLOR[color].bg }} />
    )
  }
  return (
    <div aria-hidden="true" className={`flex flex-none items-center justify-center rounded-full font-extrabold ${className}`}
      style={{ width: size, height: size, background: COLOR[color].bg, color: COLOR[color].on, border: `3px solid ${ring}`, fontSize: size * 0.41 }}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}

/** Indicador por persona: círculo relleno con check (cumplió) o anillo (pendiente). */
export function PersonDot({ color, done, label, onToggle, disabled }: {
  color: Color; done: boolean; label: string; onToggle?: () => void; disabled?: boolean
}) {
  const c = COLOR[color]
  const visual = (
    <span className="relative block size-[30px]">
      <span className="absolute inset-0 rounded-full" style={{ border: `3px solid ${c.bg}` }} />
      <motion.span className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: c.bg }}
        initial={false} animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 18 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.on} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <motion.path d="M20 6 9 17l-5-5" initial={false} animate={{ pathLength: done ? 1 : 0 }} transition={{ duration: 0.25, delay: done ? 0.08 : 0 }} />
        </svg>
      </motion.span>
    </span>
  )
  if (!onToggle) return <span role="img" aria-label={label} className="flex size-[30px] items-center justify-center">{visual}</span>
  return (
    <motion.button type="button" aria-label={label} aria-pressed={done} disabled={disabled} onClick={onToggle}
      whileTap={{ scale: 0.85 }} className="-m-[7px] flex size-11 items-center justify-center rounded-full disabled:opacity-60">
      {visual}
    </motion.button>
  )
}

export type WeekCell = { label: string; kind: 'done' | 'today' | 'future' | 'missed' }

export function weekCells(today: string, week: { date: string; state: DayState }[], todayDone: boolean, start: string): WeekCell[] {
  return WEEK_LABELS.map((label, i) => {
    const d = new Date(`${start}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i)
    const date = d.toISOString().slice(0, 10)
    const row = week.find((w) => w.date === date)
    if (date === today) return { label, kind: todayDone ? 'done' : 'today' }
    if (date > today) return { label, kind: 'future' }
    return { label, kind: row && (row.state === 'perfect' || row.state === 'protected') ? 'done' : 'missed' }
  })
}

export function Week({ cells, variant = 'dark' }: { cells: WeekCell[]; variant?: 'dark' | 'blue' }) {
  const labelColor = variant === 'dark' ? 'text-mist' : 'text-sky-soft'
  const empty = variant === 'dark' ? 'bg-navy' : 'bg-white/15'
  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Semana">
      {cells.map((d, i) => (
        <li key={i} className="flex flex-col items-center gap-1.5">
          <span className={`text-xs font-bold ${labelColor}`} aria-hidden="true">{d.label}</span>
          {d.kind === 'done' && (
            <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16, delay: i * 0.04 }}
              className="flex size-[34px] items-center justify-center rounded-full bg-flame text-ink" role="img" aria-label={`${d.label}: cumplido`}>
              <Icon name="check" size={16} stroke={3} />
            </motion.span>
          )}
          {d.kind === 'today' && (
            <span className="box-border flex size-[34px] items-center justify-center rounded-full border-[3px] border-dashed border-flame-light text-xs font-extrabold text-flame-light">hoy</span>
          )}
          {(d.kind === 'future' || d.kind === 'missed') && (
            <span className={`size-[34px] rounded-full ${empty}`} role="img" aria-label={`${d.label}: ${d.kind === 'future' ? 'próximo' : 'sin cumplir'}`} />
          )}
        </li>
      ))}
    </ol>
  )
}

const CONFETTI = [
  { l: 40, t: 70, w: 12, h: 20, r: 3, c: '#FF8A2A', d: 0 },
  { l: 110, t: 30, w: 10, h: 10, r: 99, c: '#FFFFFF', d: 0.6 },
  { l: 300, t: 50, w: 12, h: 20, r: 3, c: '#FFC79A', d: 1.1 },
  { l: 340, t: 160, w: 10, h: 10, r: 99, c: '#FF8A2A', d: 0.3 },
  { l: 24, t: 210, w: 10, h: 16, r: 3, c: '#FFFFFF', d: 1.6 },
  { l: 250, t: 20, w: 9, h: 9, r: 99, c: '#14213D', d: 2 },
  { l: 180, t: 90, w: 8, h: 14, r: 3, c: '#FFC79A', d: 0.9 },
  { l: 70, t: 140, w: 9, h: 9, r: 99, c: '#14213D', d: 2.3 },
  { l: 210, t: 180, w: 11, h: 18, r: 3, c: '#FF8A2A', d: 1.4 },
  { l: 150, t: 10, w: 8, h: 8, r: 99, c: '#FFFFFF', d: 0.15 },
  { l: 320, t: 110, w: 8, h: 14, r: 3, c: '#14213D', d: 1.9 },
  { l: 90, t: 250, w: 10, h: 10, r: 99, c: '#FFC79A', d: 2.6 },
  { l: 270, t: 240, w: 9, h: 15, r: 3, c: '#FFFFFF', d: 0.45 },
  { l: 10, t: 40, w: 8, h: 8, r: 99, c: '#FFC79A', d: 1.25 },
  { l: 360, t: 20, w: 10, h: 16, r: 3, c: '#FF8A2A', d: 2.15 },
  { l: 130, t: 200, w: 9, h: 9, r: 99, c: '#FF8A2A', d: 0.75 },
]

export function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[320px] max-w-[390px]">
      {CONFETTI.map((p, i) => (
        <div key={i} className="confeti absolute"
          style={{ left: `${(p.l / 390) * 100}%`, top: p.t, width: p.w, height: p.h, borderRadius: p.r, background: p.c, animationDelay: `${p.d}s` }} />
      ))}
    </div>
  )
}
