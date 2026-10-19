import type { Icon as StreakIcon } from '../lib/queries'

// Trazos tomados del diseño (24×24, stroke)
const PATHS = {
  agua: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  ejercicio: 'M6.5 6.5l11 11M3 9l6-6M15 21l6-6M5 11l6-6M13 19l6-6',
  dormir: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  leer: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h6',
  meditar: 'M12 4a2 2 0 1 0 0 .01M5 20c2-1 4-1.5 7-1.5s5 .5 7 1.5M7 15l5-4 5 4M12 11v-3',
  comer: 'M12 7c-3-3-8-1-8 4 0 6 4 10 8 10s8-4 8-10c0-5-5-7-8-4zM12 7c0-2 1-4 3-4',
  check: 'M5 12l5 5L20 7',
  plus: 'M12 5v14M5 12h14',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  spark: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
  clock: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9 2h6',
  pending: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  flame: 'M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3-1-4 0-7 1-9z',
  people: 'M8 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM16.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14.5 14.3c3.3-.6 7.5 1.2 7.5 5.7',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  shieldCheck: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  hand: 'M7 11V6a2 2 0 0 1 4 0v4M11 9V4a2 2 0 0 1 4 0v6M15 9a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.5L3 14a2 2 0 0 1 3.4-2L7 13',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  archive: 'M3 4h18v4H3zM5 8v12h14V8M10 12h4',
} as const

export type IconName = keyof typeof PATHS
export const STREAK_ICONS: { id: StreakIcon; name: string }[] = [
  { id: 'agua', name: 'Agua' }, { id: 'ejercicio', name: 'Ejercicio' }, { id: 'dormir', name: 'Dormir' },
  { id: 'leer', name: 'Leer' }, { id: 'meditar', name: 'Meditar' }, { id: 'comer', name: 'Comer sano' },
]

export function Icon({ name, size = 24, stroke = 2.2, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={PATHS[name]} />
    </svg>
  )
}
