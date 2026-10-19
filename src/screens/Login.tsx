import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { errorMessage } from '../lib/queries'
import { Flame } from '../components/Flame'

export const inputClass =
  'h-[54px] w-full rounded-2xl border-2 border-line bg-white px-4 text-[17px] font-bold text-ink outline-none focus:border-sky focus:shadow-[0_4px_0_#DCE8FF]'
export const primaryClass =
  'press [--press-c:var(--color-flame-deep)] [--press-d:5px] flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-flame text-lg font-extrabold uppercase tracking-[0.5px] text-ink disabled:opacity-60'

export default function Login() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function sendCode(e?: FormEvent) {
    e?.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    setBusy(false)
    if (error) return setError(errorMessage(error))
    setStep('code')
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    setBusy(false)
    if (error) setError(errorMessage(error))
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-6 px-5 pt-16 pb-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Flame mood="idle" width={96} />
        <h1 className="font-display text-[44px] leading-none font-extrabold tracking-[-1px]">chispa</h1>
        <p className="max-w-[280px] text-base font-semibold text-muted">Rachas en pareja. Que la llama no se apague.</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'email' ? (
          <motion.form key="email" onSubmit={sendCode} className="flex flex-col gap-3"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <label htmlFor="email" className="text-sm font-extrabold">Tu correo</label>
            <input id="email" type="email" required autoComplete="email" inputMode="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inputClass} />
            <button type="submit" disabled={busy || !email.includes('@')} className={`${primaryClass} mt-2`}>
              {busy ? 'Enviando…' : 'Enviarme un código'}
            </button>
          </motion.form>
        ) : (
          <motion.form key="code" onSubmit={verify} className="flex flex-col gap-3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <label htmlFor="code" className="text-sm font-extrabold">Código que te llegó a {email}</label>
            <input id="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000"
              className={`${inputClass} text-center font-display text-[32px] tracking-[10px]`} autoFocus />
            <button type="submit" disabled={busy || code.length !== 6} className={`${primaryClass} mt-2`}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
            <div className="flex justify-between">
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="min-h-11 text-[15px] font-bold text-sky-ink">Cambiar correo</button>
              <button type="button" onClick={() => sendCode()} disabled={busy}
                className="min-h-11 text-[15px] font-bold text-sky-ink">Reenviar código</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error && <p role="alert" className="rounded-2xl border-2 border-peach-line bg-peach px-4 py-3 text-sm font-bold text-ember">{error}</p>}
    </main>
  )
}
