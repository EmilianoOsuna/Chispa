import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { motion } from 'motion/react'
import { errorMessage, useArchiveStreak, useSaveStreak, useToday, type Frequency, type Mode, type StreakInput } from '../lib/queries'
import { toast } from '../lib/toast'
import { Icon, STREAK_ICONS } from '../components/Icon'
import { primaryClass } from './Login'

const FREQS: { id: Frequency; label: string }[] = [
  { id: 'daily', label: 'Diario' }, { id: 'weekdays', label: 'Entre semana' }, { id: 'weekly', label: 'X por semana' },
]
const hhmm = (t: string) => t.slice(0, 5)

export default function StreakForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: t } = useToday()
  const save = useSaveStreak()
  const archive = useArchiveStreak()
  const existing = id ? t?.streaks.find((s) => s.id === id) : undefined
  const [form, setForm] = useState<StreakInput>(() => existing
    ? { name: existing.name, icon: existing.icon, frequency: existing.frequency, weekly_target: existing.weekly_target,
        mode: existing.mode, deadline: hhmm(existing.next_deadline), reminder: existing.reminder }
    : { name: '', icon: 'agua', frequency: 'daily', weekly_target: null, mode: 'together', deadline: '23:30', reminder: true })
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [touched, setTouched] = useState(false)

  if (id && t && !existing) return <Navigate to="/" replace />
  const editing = !!existing
  const set = <K extends keyof StreakInput>(k: K, v: StreakInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const nameMissing = !form.name.trim()

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (nameMissing) return
    save.mutate({ id, input: form }, {
      onSuccess: () => {
        if (editing && existing && form.deadline !== hhmm(existing.deadline)) toast(`La nueva hora límite aplica desde mañana`)
        navigate('/', { replace: true })
      },
      onError: (err) => toast(errorMessage(err)),
    })
  }

  function doArchive() {
    if (!confirmArchive) return setConfirmArchive(true)
    archive.mutate(id!, {
      onSuccess: () => { toast('Racha archivada'); navigate('/', { replace: true }) },
      onError: (err) => toast(errorMessage(err)),
    })
  }

  const segBtn = (on: boolean) =>
    `h-[42px] rounded-xl text-sm ${on ? 'bg-white font-extrabold text-ink shadow-[0_2px_0_#C9D2E4]' : 'bg-transparent font-bold text-muted'}`

  return (
    <form onSubmit={submit} className="flex min-h-dvh flex-col gap-[18px] px-5 pt-5 pb-7">
      <div className="flex items-center gap-3">
        <Link to="/" aria-label="Volver" className="flex size-11 items-center justify-center rounded-[14px] border-2 border-line bg-white text-ink">
          <Icon name="back" size={20} stroke={2.6} />
        </Link>
        <h1 className="m-0 font-display text-[26px] font-extrabold">{editing ? 'Editar racha' : 'Nueva racha'}</h1>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="nombre" className="text-sm font-extrabold">¿Qué quieren hacer todos los días?</label>
        <input id="nombre" type="text" maxLength={60} value={form.name} placeholder="Tomar 2 litros de agua"
          onChange={(e) => set('name', e.target.value)} onBlur={() => setTouched(true)}
          aria-invalid={touched && nameMissing} aria-describedby="nombre-error"
          className="h-[54px] rounded-2xl border-2 border-sky bg-white px-4 text-[17px] font-bold text-ink shadow-[0_4px_0_#DCE8FF] outline-none" />
        {touched && nameMissing && <span id="nombre-error" className="text-sm font-bold text-flame-deep">Ponle nombre a la racha</span>}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-extrabold">Ícono</legend>
        <div className="grid grid-cols-6 gap-2">
          {STREAK_ICONS.map((ic) => {
            const on = form.icon === ic.id
            return (
              <motion.button key={ic.id} type="button" aria-label={ic.name} aria-pressed={on} onClick={() => set('icon', ic.id)}
                whileTap={{ scale: 0.88 }} animate={{ y: on ? -2 : 0 }}
                className={`press flex h-12 items-center justify-center rounded-[14px] border-2 ${on
                  ? 'border-sky bg-sky text-white [--press-c:var(--color-sky-deep)]'
                  : 'border-line bg-white text-muted [--press-c:var(--color-line)]'}`}>
                <Icon name={ic.id} size={24} />
              </motion.button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={editing}>
        <legend className="mb-2 text-sm font-extrabold">Frecuencia</legend>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-line p-1">
          {FREQS.map((f) => (
            <button key={f.id} type="button" aria-pressed={form.frequency === f.id} className={segBtn(form.frequency === f.id)}
              onClick={() => setForm((x) => ({ ...x, frequency: f.id, weekly_target: f.id === 'weekly' ? x.weekly_target ?? 3 : null }))}>
              {f.label}
            </button>
          ))}
        </div>
        {form.frequency === 'weekly' && (
          <div className="flex items-center justify-between rounded-2xl border-2 border-line bg-white px-3.5 py-2">
            <span className="text-[15px] font-bold">Días por semana</span>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Menos" disabled={form.weekly_target! <= 1}
                onClick={() => set('weekly_target', form.weekly_target! - 1)}
                className="flex size-11 items-center justify-center rounded-xl bg-line-soft text-xl font-extrabold disabled:opacity-40">−</button>
              <span className="w-6 text-center font-display text-2xl font-extrabold" aria-live="polite">{form.weekly_target}</span>
              <button type="button" aria-label="Más" disabled={form.weekly_target! >= 6}
                onClick={() => set('weekly_target', form.weekly_target! + 1)}
                className="flex size-11 items-center justify-center rounded-xl bg-line-soft text-xl font-extrabold disabled:opacity-40">+</button>
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={editing}>
        <legend className="mb-2 text-sm font-extrabold">¿Cómo cuenta la racha?</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {([['together', 'Juntos', 'Si uno falla, se apaga para los dos'], ['solo', 'Cada quien', 'Rachas separadas, se ven mutuamente']] as [Mode, string, string][]).map(([m, title, desc]) => {
            const on = form.mode === m
            return (
              <button key={m} type="button" aria-pressed={on} onClick={() => set('mode', m)}
                className={`press flex flex-col gap-1.5 rounded-[18px] border-2 p-3 text-left text-ink ${on
                  ? 'border-flame bg-peach-soft [--press-c:var(--color-peach-line)]' : 'border-line bg-white [--press-c:var(--color-line)]'}`}>
                <span className={`flex ${m === 'solo' ? 'gap-1' : ''}`}>
                  <span className={`size-[26px] rounded-full bg-flame ${m === 'together' ? `border-2 ${on ? 'border-peach-soft' : 'border-white'}` : ''}`} />
                  <span className={`size-[26px] rounded-full bg-sky ${m === 'together' ? `-ml-2 border-2 ${on ? 'border-peach-soft' : 'border-white'}` : ''}`} />
                </span>
                <span className="text-[15px] font-extrabold">{title}</span>
                <span className="text-xs leading-[1.35] font-semibold text-muted">{desc}</span>
              </button>
            )
          })}
        </div>
        {editing && <p className="text-xs font-semibold text-muted">La frecuencia y el modo no se pueden cambiar después de crearla.</p>}
      </fieldset>

      <div className="flex flex-col rounded-[18px] border-2 border-line bg-white">
        <div className="flex items-center justify-between border-b-2 border-line-soft px-3.5 py-3">
          <label htmlFor="limite" className="text-[15px] font-bold">Hora límite</label>
          <input id="limite" type="time" required value={form.deadline} onChange={(e) => set('deadline', e.target.value)}
            className="min-h-11 rounded-[10px] border-none bg-line-soft px-2.5 text-[15px] font-extrabold text-ink" />
        </div>
        <div className="flex items-center justify-between px-3.5 py-3">
          <span id="recordar-label" className="text-[15px] font-bold">Recordarnos 2 h antes</span>
          <button type="button" role="switch" aria-checked={form.reminder} aria-labelledby="recordar-label"
            onClick={() => set('reminder', !form.reminder)}
            className={`flex h-[30px] w-[52px] rounded-full p-[3px] transition-colors ${form.reminder ? 'justify-end bg-sky' : 'justify-start bg-toggle'}`}>
            <motion.span layout transition={{ type: 'spring', stiffness: 700, damping: 35 }} className="size-6 rounded-full bg-white" />
          </button>
        </div>
      </div>

      <div className="flex-1" />

      {editing && (
        <button type="button" onClick={doArchive} disabled={archive.isPending}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-[18px] border-2 border-line text-[15px] font-extrabold text-muted">
          <Icon name="archive" size={20} />
          {confirmArchive ? '¿Seguro? Toca otra vez para archivar' : 'Archivar racha'}
        </button>
      )}
      <button type="submit" disabled={save.isPending} className={primaryClass}>
        <Icon name="flame" size={22} stroke={2.6} />
        {editing ? 'Guardar cambios' : 'Encender racha'}
      </button>
    </form>
  )
}
