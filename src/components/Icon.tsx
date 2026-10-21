import {
  AlarmClock, Apple, Archive, Bell, BookOpen, Check, ChevronLeft, ChevronRight, Clock, Copy, Droplet, Dumbbell,
  Flame, Flower2, Hand, Moon, Plus, Shield, ShieldCheck, Sparkles, Trophy, User, Users, X,
} from 'lucide-react'
import type { Icon as StreakIcon } from '../lib/queries'

// Íconos estándar de Lucide (24×24, stroke)
const ICONS = {
  agua: Droplet, ejercicio: Dumbbell, dormir: Moon, leer: BookOpen, meditar: Flower2, comer: Apple,
  check: Check, plus: Plus, back: ChevronLeft, close: X, spark: Sparkles, clock: AlarmClock, pending: Clock,
  flame: Flame, people: Users, trophy: Trophy, user: User, shield: Shield, shieldCheck: ShieldCheck,
  hand: Hand, bell: Bell, copy: Copy, chevronLeft: ChevronLeft, chevronRight: ChevronRight, archive: Archive,
} as const

export type IconName = keyof typeof ICONS
export const STREAK_ICONS: { id: StreakIcon; name: string }[] = [
  { id: 'agua', name: 'Agua' }, { id: 'ejercicio', name: 'Ejercicio' }, { id: 'dormir', name: 'Dormir' },
  { id: 'leer', name: 'Leer' }, { id: 'meditar', name: 'Meditar' }, { id: 'comer', name: 'Comer sano' },
]

export function Icon({ name, size = 24, stroke = 2.2, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  const Svg = ICONS[name]
  return <Svg size={size} strokeWidth={stroke} aria-hidden="true" className={className} />
}
