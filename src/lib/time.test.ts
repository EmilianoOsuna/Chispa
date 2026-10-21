import { expect, test } from 'vitest'
import { addDays, isoDow, msUntilMidnight, zoned } from './time'

test('fecha local cambia de día según la zona', () => {
  const at = new Date('2026-10-20T05:30:00Z') // 23:30 del 19 en CDMX
  expect(zoned('America/Mexico_City', at)).toEqual({ date: '2026-10-19', seconds: 23 * 3600 + 30 * 60 })
  expect(zoned('Europe/Madrid', at).date).toBe('2026-10-20')
})

test('cuenta regresiva a la medianoche de cada zona', () => {
  const at = new Date('2026-10-20T04:13:00Z') // 22:13 CDMX, 06:13 Madrid
  expect(msUntilMidnight('America/Mexico_City', at)).toBe((1 * 3600 + 47 * 60) * 1000)
  expect(msUntilMidnight('Europe/Madrid', at)).toBe((17 * 3600 + 47 * 60) * 1000)
})

test('cuenta regresiva cruzando cambio de horario (DST)', () => {
  // 8 mar 2026, Nueva York: a las 02:00 salta a 03:00. De 01:00 a medianoche pasan 22 h reales.
  expect(msUntilMidnight('America/New_York', new Date('2026-03-08T06:00:00Z'))).toBe(22 * 3600 * 1000)
  // 1 nov 2026, Nueva York: a las 02:00 vuelve a 01:00. De 00:30 a medianoche pasan 24.5 h reales.
  expect(msUntilMidnight('America/New_York', new Date('2026-11-01T04:30:00Z'))).toBe(24.5 * 3600 * 1000)
})

test('helpers de fecha', () => {
  expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  expect(isoDow('2026-10-18')).toBe(7)
  expect(isoDow('2026-10-19')).toBe(1)
})
