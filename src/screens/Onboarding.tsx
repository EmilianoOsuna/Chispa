import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { errorMessage } from '../lib/queries'
import { useCoupleRealtime } from '../lib/realtime'
import { toast } from '../lib/toast'
import { Flame } from '../components/Flame'
import { Icon } from '../components/Icon'
import { inputClass, primaryClass } from './Login'

type Props = {
  userId: string
  profile: { id: string; name: string } | null
  member: { couple_id: string; couples: { invite_code: string; paired_at: string | null } | null } | null
}

export default function Onboarding({ userId, profile, member }: Props) {
  const qc = useQueryClient()
  const [mode, setMode] = useState<'choose' | 'join'>('choose')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useCoupleRealtime(member?.couple_id) // el creador ve en vivo cuando su pareja se une

  const refresh = () => qc.invalidateQueries({ queryKey: ['membership'] })
  async function run(fn: () => PromiseLike<{ error: unknown }>) {
    setBusy(true); setError('')
    const { error } = await fn()
    setBusy(false)
    if (error) setError(errorMessage(error))
    else refresh()
  }

  const saveName = (e: FormEvent) => {
    e.preventDefault()
    run(() => supabase.from('profiles').upsert({ id: userId, name: name.trim() }))
  }
  const create = () => run(() => supabase.rpc('create_couple', { p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }))
  const join = (e: FormEvent) => { e.preventDefault(); run(() => supabase.rpc('join_couple', { p_code: code })) }

  let step: 'name' | 'choose' | 'join' | 'wait' = 'name'
  if (profile) step = member ? 'wait' : mode

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-6 px-5 pt-14 pb-8">
      <AnimatePresence mode="wait">
        <motion.section key={step} className="flex flex-1 flex-col gap-5"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}>

          {step === 'name' && (
            <form onSubmit={saveName} className="flex flex-col gap-3">
              <Flame mood="idle" width={72} />
              <h1 className="font-display text-[30px] leading-tight font-extrabold">¿Cómo te llamas?</h1>
              <label htmlFor="name" className="text-sm font-extrabold">Tu nombre (así te verá tu pareja)</label>
              <input id="name" required maxLength={40} autoComplete="given-name" value={name}
                onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
              <button type="submit" disabled={busy || !name.trim()} className={`${primaryClass} mt-2`}>Seguir</button>
            </form>
          )}

          {step === 'choose' && (<>
            <h1 className="font-display text-[30px] leading-tight font-extrabold">Hola, {profile!.name}. Enciendan su chispa</h1>
            <button type="button" onClick={create} disabled={busy}
              className="press [--press-c:var(--color-flame-deep)] [--press-d:5px] flex flex-col gap-1 rounded-[22px] bg-flame p-5 text-left text-ink">
              <span className="font-display text-2xl font-extrabold">Crear pareja</span>
              <span className="text-[15px] font-semibold">Te damos un código para tu pareja</span>
            </button>
            <button type="button" onClick={() => setMode('join')}
              className="press [--press-c:var(--color-sky-deep)] [--press-d:5px] flex flex-col gap-1 rounded-[22px] bg-sky p-5 text-left text-white">
              <span className="font-display text-2xl font-extrabold">Tengo un código</span>
              <span className="text-[15px] font-semibold">Mi pareja ya creó la nuestra</span>
            </button>
          </>)}

          {step === 'join' && (
            <form onSubmit={join} className="flex flex-col gap-3">
              <button type="button" onClick={() => setMode('choose')} aria-label="Volver"
                className="flex size-11 items-center justify-center rounded-[14px] border-2 border-line bg-white">
                <Icon name="back" size={20} stroke={2.6} />
              </button>
              <h1 className="font-display text-[30px] leading-tight font-extrabold">Escribe el código de tu pareja</h1>
              <label htmlFor="code" className="text-sm font-extrabold">Código de 6 caracteres</label>
              <input id="code" required maxLength={6} autoCapitalize="characters" autoComplete="off" value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className={`${inputClass} text-center font-display text-[32px] tracking-[10px]`} autoFocus />
              <button type="submit" disabled={busy || code.length !== 6} className={`${primaryClass} mt-2`}>Unirme</button>
            </form>
          )}

          {step === 'wait' && member?.couples && (
            <div className="flex flex-1 flex-col items-center gap-4 text-center">
              <Flame mood="idle" width={110} />
              <h1 className="font-display text-[30px] leading-tight font-extrabold">Comparte este código con tu pareja</h1>
              <button type="button" aria-label={`Copiar código ${member.couples.invite_code}`}
                onClick={() => navigator.clipboard.writeText(member.couples!.invite_code).then(() => toast('Código copiado'))}
                className="press [--press-c:#0A1328] [--press-d:6px] flex items-center gap-3 rounded-[22px] bg-ink px-6 py-4 font-display text-[40px] font-extrabold tracking-[8px] text-flame-light">
                {member.couples.invite_code}
                <span className="text-mist"><Icon name="copy" size={22} /></span>
              </button>
              <p className="max-w-[300px] text-base font-semibold text-muted">
                Tu pareja abre Chispa, elige “Tengo un código” y lo escribe. Esta pantalla avanza sola cuando se una.
              </p>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
      {error && <p role="alert" className="rounded-2xl border-2 border-peach-line bg-peach px-4 py-3 text-sm font-bold text-ember">{error}</p>}
    </main>
  )
}
