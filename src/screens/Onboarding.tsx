import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { errorMessage } from '../lib/queries'
import { Flame } from '../components/Flame'
import { Icon } from '../components/Icon'
import { inputClass, primaryClass } from './Login'

type Props = { userId: string; profile: { id: string; name: string } | null }

export default function Onboarding({ userId, profile }: Props) {
  const qc = useQueryClient()
  const [mode, setMode] = useState<'choose' | 'join'>('choose')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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

  const step = profile ? mode : 'name'

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

        </motion.section>
      </AnimatePresence>
      {error && <p role="alert" className="rounded-2xl border-2 border-peach-line bg-peach px-4 py-3 text-sm font-bold text-ember">{error}</p>}
    </main>
  )
}
