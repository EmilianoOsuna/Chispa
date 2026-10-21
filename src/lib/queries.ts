import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { addDays, deviceTimezone, isoDow, msUntilMidnight } from './time'
import type { AvatarStyle } from './avatar'

export type Color = 'flame' | 'sky'
export type Icon = 'agua' | 'ejercicio' | 'dormir' | 'leer' | 'meditar' | 'comer'
export type Frequency = 'daily' | 'weekdays' | 'weekly'
export type Mode = 'together' | 'solo'
export type Member = { user_id: string; name: string; color: Color; avatar_style: AvatarStyle | null; avatar_seed: string | null; today: string }

export type Streak = {
  id: string; name: string; icon: Icon; frequency: Frequency; weekly_target: number | null; mode: Mode
  reminder: boolean; reminder_time: string; due_today: boolean; closed_through: string
  protected: boolean
  /** Ayer, si sigue abierto porque voy adelantado a mi pareja. */
  prev: { due: boolean; protected: boolean; done: Record<string, boolean> } | null
  done: Record<string, boolean>
  week_count: Record<string, number>
  counters: Record<string, { current: number; best: number }>
}

export type Today = {
  me: string; now: string; today: string; timezone: string
  couple: { id: string; invite_code: string; freezes: number; best_streak: number; paired_at: string | null }
  members: Member[]
  closed_streak: number
  week: { date: string; state: DayState }[]
  sparks: number
  last_nudge: { id: string; from_user: string; streak_id: string | null; kind: 'nudge' | 'high_five'; body: string | null; created_at: string } | null
  streaks: Streak[]
}
export type DayState = 'perfect' | 'protected' | 'broken' | 'neutral'

export type Month = {
  today: string; first: string; last: string; paired_at: string | null
  days: { date: string; state: DayState; flame_all: boolean; sky_all: boolean }[]
  perfect_days: number
  compliance: Record<string, { done: number; due: number }>
}

// ---------------------------------------------------------------- errores

const MESSAGES: Record<string, string> = {
  offline: 'Necesitas conexión para hacer esto',
  day_closed: 'El día ya cerró para esta racha',
  not_due: 'Esta racha no toca hoy',
  invalid_code: 'Ese código no existe',
  couple_full: 'Esa pareja ya está completa',
  already_paired: 'Ya estás en una pareja',
  rate_limited: 'Espera unos minutos para volver a tocar',
  no_freezes: 'No tienen protectores disponibles',
  already_protected: 'Esta racha ya está protegida hoy',
  not_paired: 'Primero necesitas a tu pareja',
}
export function errorMessage(e: unknown) {
  const raw = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String(e.message) : String(e)
  return MESSAGES[raw] ?? 'Algo salió mal, intenta de nuevo'
}

function online() {
  if (!navigator.onLine) throw new Error('offline')
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  // Tipos de RPC con JSON libre; los tipos de arriba describen la forma real.
  const { data, error } = await (supabase.rpc as unknown as (f: string, a?: object) => Promise<{ data: T; error: Error | null }>)(fn, args)
  if (error) throw error
  return data
}

// ---------------------------------------------------------------- sesión y pareja

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

export function useMembership(userId: string | undefined) {
  return useQuery({
    queryKey: ['membership', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: profile }, { data: member }] = await Promise.all([
        supabase.from('profiles').select('id, name').eq('id', userId!).maybeSingle(),
        supabase.from('couple_members').select('couple_id, color, couples(invite_code, paired_at)').eq('user_id', userId!).maybeSingle(),
      ])
      return { profile, member }
    },
  })
}

/** El día de cada quien cierra a su medianoche: la zona sale del dispositivo, como en Duolingo. */
export function useTimezoneSync() {
  const { data: t } = useToday()
  const qc = useQueryClient()
  useEffect(() => {
    const tz = deviceTimezone()
    if (!t || t.timezone === tz) return
    supabase.from('profiles').update({ timezone: tz }).eq('id', t.me).then(({ error }) => {
      if (error) return
      qc.invalidateQueries({ queryKey: ['today'] })
      qc.invalidateQueries({ queryKey: ['month'] })
    })
  }, [t, qc])
}

// ---------------------------------------------------------------- lecturas

export const useToday = () => useQuery({ queryKey: ['today'], queryFn: () => rpc<Today>('today_state') })

export const useMonth = (year: number, month: number) =>
  useQuery({ queryKey: ['month', year, month], queryFn: () => rpc<Month>('month_calendar', { p_year: year, p_month: month }) })

export const useAchievements = () =>
  useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('code, unlocked_at')
      if (error) throw error
      return data
    },
  })

// ---------------------------------------------------------------- derivados (reglas de visualización)

const sundayOf = (date: string) => addDays(date, 7 - isoDow(date))

export function periodDone(s: Streak, userId: string) {
  return s.frequency === 'weekly' ? (s.week_count[userId] ?? 0) >= (s.weekly_target ?? 1) : !!s.done[userId]
}
export function pairDone(s: Streak, t: Today) {
  return t.members.every((m) => periodDone(s, m.user_id)) // con un solo miembro, basta él
}
/** Ayer aún abierto (voy adelantado): null = no cuenta, true = suma, false = rompe. Sin userId: ambos. */
function prevOk(s: Streak, userId?: string) {
  const p = s.prev
  if (!p?.due) return null
  if (p.protected) return true
  return s.mode === 'together' || !userId ? Object.values(p.done).every(Boolean) : !!p.done[userId]
}

/** Conteo mostrado: contador cerrado + ayer si sigue abierto + el periodo en curso si ya se cumplió y aún no se cierra. */
export function streakCount(s: Streak, t: Today, userId: string) {
  const end = s.frequency === 'weekly' ? sundayOf(t.today) : t.today
  const open = s.closed_through < end
  const ok = s.protected || (s.mode === 'together' ? pairDone(s, t) : periodDone(s, userId))
  const prev = prevOk(s, userId)
  const base = prev === false ? 0 : (s.counters[userId]?.current ?? 0) + (prev ? 1 : 0)
  return base + (open && ok ? 1 : 0)
}

export function summarize(t: Today) {
  const required = t.streaks.filter((s) => s.due_today && s.frequency !== 'weekly')
  const pending = required.filter((s) => !(s.protected || pairDone(s, t)))
  const todayPerfect = required.length > 0 && pending.length === 0
  const prevDue = t.streaks.filter((s) => s.prev?.due)
  const base = !prevDue.length ? t.closed_streak : prevDue.every((s) => prevOk(s)) ? t.closed_streak + 1 : 0
  const coupleStreak = base + (todayPerfect ? 1 : 0)
  return {
    required, pending, todayPerfect, coupleStreak,
    best: Math.max(t.couple.best_streak, coupleStreak),
    msToClose: pending.length ? msUntilMidnight(t.timezone) : 0,
    me: t.members.find((m) => m.user_id === t.me),
    partner: t.members.find((m) => m.user_id !== t.me),
  }
}

/** Racha Juntos donde la pareja ya cumplió, yo no, y faltan ≤ 2 h. */
export function dangerStreak(t: Today) {
  const partner = t.members.find((m) => m.user_id !== t.me)
  if (!partner) return undefined
  return t.streaks.find((s) => {
    if (s.mode !== 'together' || !s.due_today || s.protected) return false
    if (!periodDone(s, partner.user_id) || periodDone(s, t.me)) return false
    return msUntilMidnight(t.timezone) <= 2 * 3600 * 1000
  })
}

// ---------------------------------------------------------------- escrituras

export function useCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ streakId, undo, userId }: { streakId: string; undo: boolean; userId: string }) => {
      online()
      const t = qc.getQueryData<Today>(['today'])!
      // couple_id y local_date los fija el servidor; se envían porque son NOT NULL
      const { error } = undo
        ? await supabase.from('check_ins').delete().eq('streak_id', streakId).eq('user_id', userId).eq('local_date', t.today)
        : await supabase.from('check_ins').insert({ streak_id: streakId, user_id: userId, couple_id: t.couple.id, local_date: t.today })
      if (error) throw error
    },
    onMutate: async ({ streakId, undo, userId }) => {
      await qc.cancelQueries({ queryKey: ['today'] })
      const prev = qc.getQueryData<Today>(['today'])
      if (prev) {
        qc.setQueryData<Today>(['today'], {
          ...prev,
          streaks: prev.streaks.map((s) => s.id !== streakId ? s : {
            ...s,
            done: { ...s.done, [userId]: !undo },
            week_count: { ...s.week_count, [userId]: (s.week_count[userId] ?? 0) + (undo ? -1 : 1) },
          }),
        })
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(['today'], ctx.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['today'] })
      qc.invalidateQueries({ queryKey: ['month'] })
    },
  })
}

export type StreakInput = { name: string; icon: Icon; frequency: Frequency; weekly_target: number | null; mode: Mode; reminder_time: string; reminder: boolean }

export function useSaveStreak() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: StreakInput }) => {
      online()
      const t = qc.getQueryData<Today>(['today'])!
      const { error } = id
        ? await supabase.from('streaks').update({ name: input.name.trim(), icon: input.icon, reminder_time: input.reminder_time, reminder: input.reminder }).eq('id', id)
        : await supabase.from('streaks').insert({
            ...input, name: input.name.trim(), couple_id: t.couple.id, created_by: t.me,
            // el servidor los reescribe; se envían porque son NOT NULL
            start_date: t.today, closed_through: t.today,
          })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today'] }),
  })
}

export function useArchiveStreak() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      online()
      const { error } = await supabase.from('streaks').update({ archived_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today'] }),
  })
}

export function useFreeze() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (streakId: string) => { online(); await rpc('use_freeze', { p_streak: streakId }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['today'] }); qc.invalidateQueries({ queryKey: ['achievements'] }) },
  })
}

export function useNudge() {
  return useMutation({
    mutationFn: async (v: { streakId: string; body?: string; kind?: 'nudge' | 'high_five' }) => {
      online()
      await rpc('send_nudge', { p_streak: v.streakId, p_body: v.body ?? null, p_kind: v.kind ?? 'nudge' })
    },
  })
}
