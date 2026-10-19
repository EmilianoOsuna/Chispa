import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { errorMessage } from '../lib/queries'
import { Flame } from '../components/Flame'

export const inputClass =
  'h-[54px] w-full rounded-2xl border-2 border-line bg-white px-4 text-[17px] font-bold text-ink outline-none focus:border-sky focus:shadow-[0_4px_0_#DCE8FF]'
export const primaryClass =
  'press [--press-c:var(--color-flame-deep)] [--press-d:5px] flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-flame text-lg font-extrabold uppercase tracking-[0.5px] text-ink disabled:opacity-60'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setError(error.message.includes('Invalid login') ? 'Correo o contraseña incorrectos' : errorMessage(error))
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-6 px-5 pt-16 pb-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Flame mood="idle" width={96} />
        <h1 className="font-display text-[44px] leading-none font-extrabold tracking-[-1px]">chispa</h1>
        <p className="max-w-[280px] text-base font-semibold text-muted">Rachas en pareja. Que la llama no se apague.</p>
      </div>

      <motion.form onSubmit={signIn} className="flex flex-col gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <label htmlFor="email" className="text-sm font-extrabold">Tu correo</label>
        <input id="email" type="email" required autoComplete="email" inputMode="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inputClass} />
        <label htmlFor="password" className="mt-1 text-sm font-extrabold">Contraseña</label>
        <input id="password" type="password" required autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        <button type="submit" disabled={busy || !email.includes('@') || !password} className={`${primaryClass} mt-2`}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </motion.form>

      {error && <p role="alert" className="rounded-2xl border-2 border-peach-line bg-peach px-4 py-3 text-sm font-bold text-ember">{error}</p>}
    </main>
  )
}
