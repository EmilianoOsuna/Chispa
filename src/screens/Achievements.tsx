import { motion } from 'motion/react'
import { summarize, useAchievements, useToday } from '../lib/queries'
import { ACHIEVEMENTS, TONE } from '../lib/achievements'
import { Count } from '../components/bits'
import { Icon } from '../components/Icon'

export default function Achievements() {
  const { data: t } = useToday()
  const { data: unlocked = [] } = useAchievements()
  if (!t) return null
  const sum = summarize(t)
  const when = new Map(unlocked.map((a) => [a.code, a.unlocked_at]))
  const next = ACHIEVEMENTS.find((a) => a.goal && !when.has(a.code))
  const prevGoal = next ? Math.max(0, ...ACHIEVEMENTS.filter((a) => a.goal && a.goal < next.goal!).map((a) => a.goal!)) : 0
  const progress = next ? Math.min(1, Math.max(0, (sum.coupleStreak - prevGoal) / (next.goal! - prevGoal))) : 1
  const date = (iso: string) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: t.couple.timezone }).format(new Date(iso)).replace('.', '')

  return (
    <main className="flex flex-col gap-4 px-[18px] pt-[18px] pb-32">
      <header className="flex h-11 items-center justify-between">
        <h1 className="m-0 font-display text-[26px] font-extrabold">Logros</h1>
        <span className="text-[13px] font-bold text-muted">{when.size} de {ACHIEVEMENTS.length}</span>
      </header>

      <section className="shadow-solid flex flex-col gap-3 rounded-[24px] bg-ink p-5 text-white [--press-c:var(--color-ink-deep)] [--press-d:6px]">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-mist">{next ? 'Siguiente meta' : '¡Completaron todo!'}</span>
            <span className="font-display text-2xl font-extrabold">{next?.label ?? 'Leyendas de la llama'}</span>
          </div>
          <div className="flex items-baseline gap-1 text-flame-light">
            <Count value={sum.coupleStreak} className="font-display text-[44px] leading-none font-extrabold" />
            {next && <span className="font-display text-xl font-extrabold text-mist">/ {next.goal}</span>}
          </div>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-navy" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <motion.div className="h-full rounded-full bg-flame" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.15 }} />
        </div>
        <div className="flex justify-between text-[13px] font-bold text-mist">
          <span>{next ? `Faltan ${Math.max(0, next.goal! - sum.coupleStreak)} días en pareja` : 'Sigan así'}</span>
          <span className="flex items-center gap-1"><Icon name="shield" size={16} /> {t.couple.freezes} protector{t.couple.freezes === 1 ? '' : 'es'}</span>
        </div>
      </section>

      <ul className="grid grid-cols-2 gap-2.5">
        {ACHIEVEMENTS.map((a, i) => {
          const at = when.get(a.code)
          return (
            <motion.li key={a.code} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.05 + i * 0.05 }}
              className={`flex flex-col gap-2 rounded-[20px] border-2 p-3.5 ${at ? 'border-line bg-white shadow-[0_4px_0_#E3E8F2]' : 'border-dashed border-mist bg-transparent'}`}>
              {at ? (
                <div className={`shadow-solid flex size-[52px] items-center justify-center rounded-[16px] ${TONE[a.tone]}`}>
                  {a.icon ? <Icon name={a.icon} size={26} stroke={2.4} /> : <span className="font-display text-lg font-extrabold">{a.goal}</span>}
                </div>
              ) : (
                <div className="box-border flex size-[52px] items-center justify-center rounded-[16px] border-2 border-dashed border-mist font-display text-lg font-extrabold text-muted">
                  {a.goal ?? (a.icon && <Icon name={a.icon} size={24} />)}
                </div>
              )}
              <span className={`text-[15px] font-extrabold ${at ? '' : 'text-muted'}`}>{a.label}</span>
              <span className="text-xs leading-[1.35] font-semibold text-muted">{a.description}</span>
              <span className={`text-xs font-extrabold ${at ? 'text-flame-deep' : 'text-faint'}`}>{at ? `Desbloqueado el ${date(at)}` : 'Bloqueado'}</span>
            </motion.li>
          )
        })}
      </ul>
    </main>
  )
}
