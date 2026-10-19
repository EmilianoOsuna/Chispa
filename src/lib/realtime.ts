import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Today } from './queries'
import { toast } from './toast'

/** Un canal por pareja; cada cambio invalida lo que se ve en pantalla. */
export function useCoupleRealtime(coupleId: string | undefined) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!coupleId) return
    const filter = `couple_id=eq.${coupleId}`
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ['today'] })
      qc.invalidateQueries({ queryKey: ['month'] })
      qc.invalidateQueries({ queryKey: ['achievements'] })
    }
    const channel = supabase
      .channel(`couple:${coupleId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'check_ins', filter }, refresh)
      // DELETE no admite filtro: llega solo la llave primaria
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'check_ins' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` }, refresh)
      // RLS limita a mi perfil y el de mi pareja
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_days', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freeze_uses', filter }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements', filter }, () => {
        refresh()
        toast('¡Desbloquearon un logro nuevo!')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'couple_members', filter }, (p) => {
        refresh()
        qc.invalidateQueries({ queryKey: ['membership'] })
        const t = qc.getQueryData<Today>(['today'])
        if (t && (p.new as { user_id: string }).user_id !== t.me) toast('¡Tu pareja se unió a Chispa!')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nudges', filter }, (p) => {
        refresh()
        const t = qc.getQueryData<Today>(['today'])
        const n = p.new as { to_user: string; from_user: string; kind: string; body: string | null }
        if (t && n.to_user === t.me) {
          const from = t.members.find((m) => m.user_id === n.from_user)?.name ?? 'Tu pareja'
          toast(n.kind === 'high_five' ? `${from} chocó las cinco contigo` : `${from} te mandó un toque${n.body ? `: ${n.body}` : ''}`)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [coupleId, qc])
}
