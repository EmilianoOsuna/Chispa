// Fecha y hora "de pared" en la zona horaria de la pareja, sin librerías.

export function zoned(tz: string, at = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(at)
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]))
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    seconds: Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second),
  }
}

const toSeconds = (hms: string) => {
  const [h, m, s = 0] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

/** ms desde `at` hasta la hora límite `deadline` (HH:MM[:SS]) de hoy en `tz`; 0 si ya pasó. */
export function msUntil(deadline: string, tz: string, at = new Date()): number {
  const now = zoned(tz, at)
  const target = toSeconds(deadline)
  if (target <= now.seconds) return 0
  // Primera aproximación con reloj de pared; luego se corrige por si hay cambio de horario en medio.
  let t = at.getTime() - at.getMilliseconds() + (target - now.seconds) * 1000
  const check = zoned(tz, new Date(t))
  if (check.date === now.date) t += (target - check.seconds) * 1000
  return Math.max(0, t - at.getTime())
}

export function splitMs(ms: number) {
  const total = Math.floor(ms / 1000)
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}

export const pad = (n: number) => String(n).padStart(2, '0')

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** 1 = lunes … 7 = domingo */
export function isoDow(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay() || 7
}

export const WEEK_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre']
export const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
