## 1. Base de datos

- [ ] 1.1 Migración: `profiles.timezone` (not null, validada) con backfill desde `couples.timezone`; `set_timezone` sobre el perfil propio; `create_couple` sin parámetro de zona; drop `couples.timezone`. Verificar con `supabase db reset` sin errores
- [ ] 1.2 Migración: `streaks.deadline` → `reminder_time` con backfill (−2 h), drop `pending_deadline`/`pending_from`/`deadline_on`. Verificar con `supabase db reset`
- [ ] 1.3 `user_today(uid)` y nuevo `check_in_guard` (fecha local de quien marca; rechaza `<= closed_through`; deshacer solo en el mismo día local). Verificar con un test pgTAP: check-in tras viaje al oeste sobre día cerrado → `day_closed`
- [ ] 1.4 `close_due_days`: cerrar mientras `d < least(today(flame), today(sky))`. Actualizar `supabase/tests/02_close_days.sql` con el escenario CDMX/Madrid (D sigue abierto mientras CDMX está en D; cierra a medianoche CDMX) y verificar `supabase test db` en verde
- [ ] 1.5 `use_freeze` y nudges del día con `user_today`. Verificar con test pgTAP de protector en zona distinta
- [ ] 1.6 `today_state`: fecha del que consulta, `members[].today`, `reminder_time` en lugar de `deadline`/`next_deadline`. Verificar llamando la RPC con `app.now` fijo para ambos miembros
- [ ] 1.7 Recordatorios push por zona del miembro y `reminder_time`, dedupe por fecha local. Verificar con test pgTAP: misma racha, 21:30 CDMX y 21:30 Madrid generan pushes en momentos distintos
- [ ] 1.8 Regenerar `src/lib/database.types.ts` y verificar `tsc -b`

## 2. Front

- [ ] 2.1 `time.ts`: `msUntilMidnight(tz)` en lugar de `msUntil(deadline, tz)`; actualizar `time.test.ts` (incluye día con cambio de horario) y verificar que pasa
- [ ] 2.2 Sincronizar zona del dispositivo al iniciar y al volver a primer plano (`set_timezone` si cambió + invalidar `today`). Verificar cambiando la zona en DevTools > Sensors
- [ ] 2.3 Hoy, StreakRow y Danger: cuenta regresiva a tu medianoche y "ya va en mañana" si `partner.today > today`. Verificar en el navegador con `app.now` / zonas distintas
- [ ] 2.4 StreakForm: "Hora del recordatorio" y sin toast de "aplica desde mañana". Verificar crear/editar racha
- [ ] 2.5 Perfil y Onboarding: quitar GPS y desinstalar `@photostructure/tz-lookup`; `create_couple` sin zona. Verificar `npm run build` y que `tz-lookup` no aparece en el bundle

## 3. Integración

- [ ] 3.1 Flujo con dos navegadores en zonas distintas (CDMX y Madrid): ambos marcan en su día → el día de pareja cierra a medianoche CDMX y la racha sube; uno falla → se rompe. Verificar también que el recordatorio llega a cada quien a su hora
