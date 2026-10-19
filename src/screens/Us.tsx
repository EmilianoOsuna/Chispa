import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { motion } from 'motion/react'
import { summarize, useAchievements, useMonth, useToday, type Month } from '../lib/queries'
import { isoDow, MONTHS, WEEK_LABELS } from '../lib/time'
import { COLOR } from '../components/bits'
import { Icon, type IconName } from '../components/Icon'

const ACHIEVEMENTS: { code: string; label: string; icon?: IconName; goal?: number; tone: 'flame' | 'sky' | 'ink' }[] = [
  { code: 'week', label: 'Primera semana', icon: 'flame', goal: 7, tone: 'flame' },
  { code: 'sleep30', label: '30 noches temprano', icon: 'dormir', tone: 'sky' },
  { code: 'saved', label: 'Racha salvada', icon: 'shieldCheck', tone: 'ink' },
  { code: 'fifty', label: 'Medio centenar', goal: 50, tone: 'flame' },
  { code: 'hundred', label: 'Centenario', goal: 100, tone: 'sky' },
]
const TONE = {
  flame: 'bg-flame text-ink [--press-c:var(--color-flame-deep)]',
  sky: 'bg-sky text-white [--press-c:var(--color-sky-deep)]',
  ink: 'bg-ink text-flame-light [--press-c:var(--color-ink-deep)]',
}

type Cell = { n: string; style: string; aria: string }

function calendarCells(m: Month, names: { flame: string; sky: string }): Cell[] {
  const cells: Cell[] = []
  for (let i = 1; i < isoDow(m.first); i++) cells.push({ n: '', style: '', aria: '' })
  const lastDay = Number(m.last.slice(8, 10))
  const month = MONTHS[Number(m.first.slice(5, 7)) - 1]
  for (let day = 1; day <= lastDay; day++) {
    const date = `${m.first.slice(0, 8)}${String(day).padStart(2, '0')}`
    const row = m.days.find((d) => d.date === date)
    let style = 'bg-white text-muted border-2 border-line', what = 'sin cumplir completo'
    if (date === m.today) { style = 'bg-white border-[3px] border-flame text-ink'; what = 'hoy' }
    else if (date > m.today) { style = 'bg-line-soft text-faint'; what = 'próximo' }
    else if (row?.state === 'perfect' || row?.state === 'protected') { style = 'bg-ink text-white'; what = row.state === 'protected' ? 'protegido' : 'los dos cumplieron todo' }
    else if (row?.flame_all) { style = 'bg-flame text-ink'; what = `solo ${names.flame} cumplió todo` }
    else if (row?.sky_all) { style = 'bg-sky text-white'; what = `solo ${names.sky} cumplió todo` }
    else if (!row || row.state === 'neutral') { style = 'bg-line-soft text-muted'; what = 'sin rachas' }
    cells.push({ n: String(day), style, aria: `${day} de ${month}, ${what}` })
  }
  while (cells.length % 7) cells.push({ n: '', style: '', aria: '' })
  return cells
}

export default function Us() {
  const { hash } = useLocation()
  const { data: t } = useToday()
  const now = t ? new Date(`${t.today}T12:00:00Z`) : new Date()
  const [ym, setYm] = useState({ y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 })
  const { data: month } = useMonth(ym.y, ym.m)
  const { data: unlocked = [] } = useAchievements()

  useEffect(() => {
    if (hash === '#logros') document.getElementById('logros')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [hash])

  if (!t) return null
  const sum = summarize(t)
  const flame = t.members.find((x) => x.color === 'flame')
  const sky = t.members.find((x) => x.color === 'sky')
  const isCurrent = t.today.startsWith(`${ym.y}-${String(ym.m).padStart(2, '0')}`)
  const paired = t.couple.paired_at ? new Date(t.couple.paired_at) : null
  const since = paired && new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: t.couple.timezone }).format(paired).replace('.', '')
  const has = new Set(unlocked.map((a) => a.code))
  const next = ACHIEVEMENTS.find((a) => a.goal && !has.has(a.code))
  const shift = (d: number) => setYm(({ y, m }) => { const k = y * 12 + (m - 1) + d; return { y: Math.floor(k / 12), m: (k % 12) + 1 } })

  return (
    <main className="flex flex-col gap-3.5 px-[18px] pt-[18px] pb-32">
      <header className="flex h-11 items-center justify-between">
        <h1 className="m-0 font-display text-[26px] font-extrabold">Nosotros</h1>
        {since && <span className="text-[13px] font-bold text-muted">juntos desde {since}</span>}
      </header>

      <div className="grid grid-cols-2 gap-2.5">
        {t.members.map((mem, i) => {
          const c = month?.compliance?.[mem.user_id]
          const pct = c && c.due ? Math.round((c.done / c.due) * 100) : null
          return (
            <motion.div key={mem.user_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="shadow-solid flex flex-col gap-0.5 rounded-[22px] p-3.5 [--press-d:5px]"
              style={{ background: COLOR[mem.color].bg, color: COLOR[mem.color].on, ['--press-c' as string]: COLOR[mem.color].deep }}>
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full text-[13px] font-extrabold"
                  style={mem.color === 'flame' ? { background: '#14213D', color: '#FF9A45' } : { background: '#FFFFFF', color: '#1D4ED8' }}>
                  {mem.name[0]}
                </div>
                <span className="text-[15px] font-extrabold">{mem.name}</span>
              </div>
              <span className="font-display text-[40px] leading-[1.05] font-extrabold">{pct === null ? '—' : `${pct}%`}</span>
              <span className="text-xs font-bold">cumplimiento {isCurrent ? 'este mes' : MONTHS[ym.m - 1]}</span>
            </motion.div>
          )
        })}
      </div>

      <section className="flex flex-col gap-2.5 rounded-[22px] border-2 border-line bg-white p-3.5" aria-label="Calendario">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Mes anterior" onClick={() => shift(-1)} className="-ml-2 flex size-11 items-center justify-center rounded-xl text-muted">
              <Icon name="chevronLeft" size={20} stroke={2.6} />
            </button>
            <span className="font-display text-lg font-extrabold capitalize">{MONTHS[ym.m - 1]}{ym.y !== now.getUTCFullYear() ? ` ${ym.y}` : ''}</span>
            <button type="button" aria-label="Mes siguiente" onClick={() => shift(1)} disabled={isCurrent} className="flex size-11 items-center justify-center rounded-xl text-muted disabled:opacity-30">
              <Icon name="chevronRight" size={20} stroke={2.6} />
            </button>
          </div>
          <span className="text-[13px] font-bold text-muted">{month?.perfect_days ?? 0} días perfectos</span>
        </div>
        <div className="grid grid-cols-7 gap-[5px]">
          {WEEK_LABELS.map((h, i) => <span key={i} aria-hidden="true" className="text-center text-[11px] font-extrabold text-muted">{h}</span>)}
          {month && flame && sky && calendarCells(month, { flame: flame.name, sky: sky.name }).map((d, i) => (
            <motion.div key={`${ym.y}-${ym.m}-${i}`} aria-label={d.aria || undefined} aria-hidden={d.n ? undefined : true}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.008 }}
              className={`box-border flex h-9 items-center justify-center rounded-[10px] text-[13px] font-extrabold ${d.style}`}>{d.n}</motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold text-muted">
          <span className="flex items-center gap-[5px]"><span className="size-3 rounded bg-ink" />Los dos, todo</span>
          <span className="flex items-center gap-[5px]"><span className="size-3 rounded bg-flame" />Solo {flame?.name}</span>
          <span className="flex items-center gap-[5px]"><span className="size-3 rounded bg-sky" />Solo {sky?.name}</span>
        </div>
      </section>

      <section id="logros" className="flex scroll-mt-4 flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-display text-xl font-extrabold">Logros</h2>
          {next && <span className="text-[13px] font-bold text-flame-deep">Siguiente: {next.goal} días · faltan {Math.max(0, next.goal! - sum.coupleStreak)}</span>}
        </div>
        <ul className="grid grid-cols-5 gap-1.5">
          {ACHIEVEMENTS.map((a, i) => {
            const on = has.has(a.code)
            return (
              <motion.li key={a.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="flex flex-col items-center gap-1">
                {on ? (
                  <div className={`shadow-solid flex size-[62px] items-center justify-center rounded-[20px] ${TONE[a.tone]}`}>
                    {a.icon ? <Icon name={a.icon} size={28} stroke={2.4} /> : <span className="font-display text-xl font-extrabold">{a.goal}</span>}
                  </div>
                ) : (
                  <div className="box-border flex size-[62px] items-center justify-center rounded-[20px] border-2 border-dashed border-mist bg-white font-display text-xl font-extrabold text-muted">
                    {a.goal ?? (a.icon && <Icon name={a.icon} size={26} />)}
                  </div>
                )}
                <span className={`text-center text-[11px] font-bold ${on ? '' : 'text-muted'}`}>{a.label}</span>
              </motion.li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
