import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { errorMessage, useToday } from '../lib/queries'
import { currentSubscription, disablePush, enablePush, isIos, isStandalone, pushSupported } from '../lib/push'
import { toast } from '../lib/toast'
import { Avatar } from '../components/bits'
import { Icon } from '../components/Icon'

export default function Profile() {
  const qc = useQueryClient()
  const { data: t } = useToday()
  const me = t?.members.find((m) => m.user_id === t.me)
  const [name, setName] = useState(me?.name ?? '')
  const [push, setPush] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { currentSubscription().then((s) => setPush(!!s)) }, [])
  useEffect(() => { if (me) setName(me.name) }, [me])
  if (!t || !me) return null

  const iosNeedsInstall = isIos && !isStandalone

  async function saveName(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', t!.me)
    if (error) return toast(errorMessage(error))
    toast('Nombre guardado')
    qc.invalidateQueries({ queryKey: ['today'] })
  }

  async function togglePush() {
    setBusy(true)
    try {
      if (push) { await disablePush(); setPush(false) }
      else { await enablePush(t!.me); setPush(true); toast('Notificaciones activadas') }
    } catch (e) {
      toast(e instanceof Error && e.message.startsWith('Permiso') ? e.message : errorMessage(e))
    }
    setBusy(false)
  }

  async function signOut() {
    await disablePush().catch(() => {})
    await supabase.auth.signOut()
    qc.clear()
    localStorage.removeItem('chispa-cache')
  }

  return (
    <main className="flex flex-col gap-4 px-[18px] pt-[18px] pb-32">
      <header className="flex h-11 items-center">
        <h1 className="m-0 font-display text-[26px] font-extrabold">Perfil</h1>
      </header>

      <div className="flex items-center gap-3">
        <Avatar name={me.name} color={me.color} size={56} />
        <div className="text-[13px] font-bold text-muted">Tu color en Chispa es {me.color === 'flame' ? 'naranja' : 'azul'}</div>
      </div>

      <form onSubmit={saveName} className="flex flex-col gap-2">
        <label htmlFor="nombre" className="text-sm font-extrabold">Tu nombre</label>
        <div className="flex gap-2">
          <input id="nombre" maxLength={40} required value={name} onChange={(e) => setName(e.target.value)}
            className="h-[54px] min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-4 text-[17px] font-bold outline-none focus:border-sky" />
          <button type="submit" disabled={!name.trim() || name.trim() === me.name}
            className="press [--press-c:var(--color-sky-deep)] h-[54px] rounded-2xl bg-sky px-4 font-extrabold text-white disabled:opacity-50">Guardar</button>
        </div>
      </form>

      <div className="flex flex-col rounded-[18px] border-2 border-line bg-white">
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <span className="flex items-center gap-2.5">
            <span className="text-sky-ink"><Icon name="bell" size={22} /></span>
            <span id="push-label" className="text-[15px] font-bold">Notificaciones</span>
          </span>
          <button type="button" role="switch" aria-checked={push} aria-labelledby="push-label" onClick={togglePush}
            disabled={busy || !pushSupported || iosNeedsInstall}
            className={`flex h-[30px] w-[52px] rounded-full p-[3px] transition-colors disabled:opacity-50 ${push ? 'justify-end bg-sky' : 'justify-start bg-toggle'}`}>
            <span className="size-6 rounded-full bg-white" />
          </button>
        </div>
        {(iosNeedsInstall || !pushSupported) && (
          <p className="border-t-2 border-line-soft px-3.5 py-3 text-[13px] font-semibold text-muted">
            {iosNeedsInstall
              ? 'En iPhone primero añade Chispa a tu pantalla de inicio (Compartir › Añadir a inicio) y ábrela desde ahí.'
              : 'Este navegador no soporta notificaciones.'}
          </p>
        )}
        <div className="flex items-center justify-between border-t-2 border-line-soft px-3.5 py-3 text-[15px] font-bold">
          <span>Zona horaria</span>
          <span className="text-muted">{t.couple.timezone}</span>
        </div>
      </div>

      <button type="button" onClick={signOut}
        className="flex min-h-[52px] items-center justify-center rounded-[18px] border-2 border-line text-[15px] font-extrabold text-flame-deep">
        Cerrar sesión
      </button>
    </main>
  )
}
