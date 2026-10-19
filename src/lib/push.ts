import { supabase } from './supabase'

export const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
export const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
export const isStandalone =
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

function vapidKey() {
  const b64 = import.meta.env.VITE_VAPID_PUBLIC_KEY as string
  const raw = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export async function currentSubscription() {
  if (!pushSupported || Notification.permission !== 'granted') return null
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (!sub) return null
  // puede existir una suscripción ajena al proyecto en el mismo origen (p. ej. localhost)
  const { data } = await supabase.from('push_subscriptions').select('endpoint').eq('endpoint', sub.endpoint).maybeSingle()
  return data ? sub : null
}

export async function enablePush(userId: string) {
  if (await Notification.requestPermission() !== 'granted') throw new Error('Permiso de notificaciones denegado')
  const reg = await navigator.serviceWorker.ready
  const old = await reg.pushManager.getSubscription()
  const key = vapidKey()
  const sameKey = old?.options.applicationServerKey &&
    new Uint8Array(old.options.applicationServerKey).every((b, i) => b === key[i])
  if (old && !sameKey) await old.unsubscribe()
  const sub = (sameKey ? old : null)
    ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
  const { endpoint, keys } = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  const { error } = await supabase.from('push_subscriptions').upsert({ endpoint, user_id: userId, p256dh: keys.p256dh, auth: keys.auth })
  if (error) throw error
}

export async function disablePush() {
  const sub = await currentSubscription()
  if (!sub) return
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  await sub.unsubscribe()
}
