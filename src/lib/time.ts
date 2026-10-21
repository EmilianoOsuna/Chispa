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

/** Zona IANA del dispositivo. */
export const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

/** ms desde `at` hasta la próxima medianoche en `tz`. */
export function msUntilMidnight(tz: string, at = new Date()): number {
  const now = zoned(tz, at)
  // Primera aproximación con reloj de pared; luego se corrige por si hay cambio de horario en medio.
  let t = at.getTime() - at.getMilliseconds() + (86400 - now.seconds) * 1000
  const check = zoned(tz, new Date(t))
  t += (check.date === now.date ? 86400 - check.seconds : -check.seconds) * 1000
  return t - at.getTime()
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
