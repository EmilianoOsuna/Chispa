import { expect, test } from 'vitest'
import { addDays, isoDow, msUntil, zoned } from './time'

test('fecha local cambia de día según la zona', () => {
  const at = new Date('2026-10-20T05:30:00Z') // 23:30 del 19 en CDMX
  expect(zoned('America/Mexico_City', at)).toEqual({ date: '2026-10-19', seconds: 23 * 3600 + 30 * 60 })
  expect(zoned('Europe/Madrid', at).date).toBe('2026-10-20')
})

test('cuenta regresiva simple y hora ya pasada', () => {
  const at = new Date('2026-10-19T03:43:00Z') // 21:43 CDMX
  expect(msUntil('23:30', 'America/Mexico_City', at)).toBe((1 * 3600 + 47 * 60) * 1000)
  expect(msUntil('21:00', 'America/Mexico_City', at)).toBe(0)
})

test('cuenta regresiva cruzando cambio de horario (DST)', () => {
  // 8 mar 2026, Nueva York: a las 02:00 salta a 03:00. De 01:00 a 04:00 pasan 2 h reales.
  const at = new Date('2026-03-08T06:00:00Z') // 01:00 EST
  expect(msUntil('04:00', 'America/New_York', at)).toBe(2 * 3600 * 1000)
})

test('helpers de fecha', () => {
  expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  expect(isoDow('2026-10-18')).toBe(7)
  expect(isoDow('2026-10-19')).toBe(1)
})
