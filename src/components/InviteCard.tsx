import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { currentSubscription, enablePush, isIos, isStandalone, pushSupported } from '../lib/push'
import { errorMessage } from '../lib/queries'
import { toast } from '../lib/toast'
import { Icon } from './Icon'

/** Mientras la pareja no se une: código para invitarla y opción de que avise por push. */
export function InviteCard({ code, userId }: { code: string; userId: string }) {
  const [push, setPush] = useState<boolean | null>(null)
  useEffect(() => { currentSubscription().then((s) => setPush(!!s)) }, [])
  const canPush = pushSupported && !(isIos && !isStandalone)

  async function share() {
    const text = `Únete a mi Chispa con el código ${code}`
    if (navigator.share) await navigator.share({ title: 'Chispa', text, url: location.origin }).catch(() => {})
    else await navigator.clipboard.writeText(code).then(() => toast('Código copiado'))
  }

  async function notify() {
    try { await enablePush(userId); setPush(true); toast('Te avisaremos cuando se una') }
    catch (e) { toast(e instanceof Error && e.message.startsWith('Permiso') ? e.message : errorMessage(e)) }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-[22px] border-2 border-dashed border-sky-pale bg-white p-4" aria-label="Invita a tu pareja">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[13px] font-extrabold tracking-[1px] text-sky-ink uppercase">Esperando a tu pareja</span>
          <span className="text-sm font-semibold text-muted">Que elija “Tengo un código” y escriba:</span>
        </div>
        <button type="button" onClick={share} aria-label={`Compartir código ${code}`}
          className="press [--press-c:#0A1328] flex items-center gap-2 rounded-2xl bg-ink px-3.5 py-2 font-display text-2xl font-extrabold tracking-[4px] text-flame-light">
          {code}
          <span className="text-mist"><Icon name="copy" size={18} /></span>
        </button>
      </div>
      {push === false && (
        canPush ? (
          <button type="button" onClick={notify}
            className="press [--press-c:var(--color-sky-deep)] flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-sky px-3 text-[15px] font-extrabold text-white">
            <Icon name="bell" size={18} /> Avísame cuando se una
          </button>
        ) : (
          <p className="text-[13px] font-semibold text-muted">
            {isIos ? 'Para que te avise cuando se una, añade Chispa a tu pantalla de inicio y ábrela desde ahí.' : 'Este navegador no soporta notificaciones; te avisaremos aquí en la app.'}
          </p>
        )
      )}
    </motion.section>
  )
}
