// Envía Web Push. Solo la invoca la base de datos (pg_net) con el secreto compartido.
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:hola@chispa.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

type Payload = { title: string; body: string; url: string; tag: string }

async function sendTo(userId: string, payload: Payload) {
  const { data: subs } = await db.from('push_subscriptions').select('endpoint, p256dh, auth').eq('user_id', userId)
  let sent = 0
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload))
      sent++
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode
      if (status === 404 || status === 410) await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      else console.error('push falló', status, (e as Error).message)
    }
  }
  return sent
}

Deno.serve(async (req) => {
  if (req.headers.get('x-push-secret') !== Deno.env.get('PUSH_SECRET')) return new Response('forbidden', { status: 403 })
  const body = await req.json() as
    | { mode: 'reminders' }
    | { mode: 'nudge'; nudge_id: string }
    | { mode: 'joined'; couple_id: string; user_id: string }
  let sent = 0

  if (body.mode === 'reminders') {
    const { data, error } = await db.rpc('claim_reminders')
    if (error) return new Response(error.message, { status: 500 })
    for (const r of data as { user_id: string; streak_id: string; streak_name: string; at_stake: number }[]) {
      sent += await sendTo(r.user_id, {
        title: `${r.streak_name}: quedan 2 horas`,
        body: r.at_stake > 0 ? `No dejes que se apaguen ${r.at_stake} ${r.at_stake === 1 ? 'día' : 'días'} de racha.` : 'Márcala antes de la hora límite.',
        url: `/?streak=${r.streak_id}`,
        tag: `reminder-${r.streak_id}`,
      })
    }
  } else if (body.mode === 'joined') {
    const [{ data: who }, { data: others }] = await Promise.all([
      db.from('profiles').select('name').eq('id', body.user_id).single(),
      db.from('couple_members').select('user_id').eq('couple_id', body.couple_id).neq('user_id', body.user_id),
    ])
    for (const o of others ?? []) {
      sent += await sendTo(o.user_id, {
        title: `${who?.name ?? 'Tu pareja'} se unió a Chispa`,
        body: 'Ya pueden mantener la llama encendida juntos.',
        url: '/',
        tag: 'joined',
      })
    }
  } else {
    const { data: n } = await db.from('nudges')
      .select('to_user, kind, body, streak_id, from:profiles!nudges_from_user_fkey(name)')
      .eq('id', body.nudge_id).single()
    if (!n) return new Response('not found', { status: 404 })
    const from = (n.from as unknown as { name: string }).name
    sent = await sendTo(n.to_user, {
      title: n.kind === 'high_five' ? `${from} chocó las cinco contigo` : `${from} te mandó un toque`,
      body: n.body ?? (n.kind === 'high_five' ? '¡La llama sigue viva!' : 'Ábrela para no perder la racha.'),
      url: n.streak_id ? `/?streak=${n.streak_id}` : '/',
      tag: `nudge-${n.streak_id}`,
    })
  }
  return Response.json({ sent })
})
