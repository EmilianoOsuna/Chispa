import type { IconName } from '../components/Icon'

export type Achievement = {
  code: string; label: string; description: string
  icon?: IconName; goal?: number; tone: 'flame' | 'sky' | 'ink'
}

// Los códigos los otorga la base de datos (close_couple_day, close_streak_day, use_freeze, check_in_saved).
export const ACHIEVEMENTS: Achievement[] = [
  { code: 'week', label: 'Primera semana', description: '7 días seguidos en pareja', icon: 'flame', goal: 7, tone: 'flame' },
  { code: 'sleep30', label: '30 noches temprano', description: '30 días de racha en Dormir', icon: 'dormir', tone: 'sky' },
  { code: 'saved', label: 'Racha salvada', description: 'Usar un protector o cumplir tras un toque', icon: 'shieldCheck', tone: 'ink' },
  { code: 'fifty', label: 'Medio centenar', description: '50 días seguidos en pareja', goal: 50, tone: 'flame' },
  { code: 'hundred', label: 'Centenario', description: '100 días seguidos en pareja', goal: 100, tone: 'sky' },
]

export const TONE = {
  flame: 'bg-flame text-ink [--press-c:var(--color-flame-deep)]',
  sky: 'bg-sky text-white [--press-c:var(--color-sky-deep)]',
  ink: 'bg-ink text-flame-light [--press-c:var(--color-ink-deep)]',
}
