## Context

Ver proposal.md (Why). Hoy:

- `couples.timezone` es la única zona; `couple_now()` y `app_now() at time zone c.timezone` se usan en `check_in_guard`, `close_due_days`, `today_state`, `use_freeze`, nudges y en el cron de recordatorios push.
- `streaks.deadline` (+ `pending_deadline`/`pending_from` vía `deadline_on`) corta check-ins y dispara el cierre de cada racha antes de la medianoche.
- `close_due_days` corre cada 5 min con pg_cron y avanza `streaks.closed_through` / `couples.closed_through`.
- Perfil fija la zona con GPS + `@photostructure/tz-lookup` → `set_timezone`.

## Goals / Non-Goals

**Goals:**
- Medianoche por persona, cierre de pareja con el más atrasado (specs/streaks).
- Zona por persona, sincronizada del dispositivo (specs/couple-pairing).
- Menos código: se van `deadline_on`, `pending_*`, GPS y `tz-lookup`.

**Non-Goals:**
- Recalcular días ya cerrados con la nueva regla.
- Límite anti-abuso de cambios de zona como el de Duolingo; basta la regla "no se reabre un día cerrado".

## Decisions

### Zona en `profiles.timezone`
`profiles.timezone text not null`, validada contra `pg_timezone_names` con un trigger (una zona inválida rompería el cierre de todas las parejas). Backfill con la zona de la pareja de cada miembro y luego `drop column couples.timezone`. Se elimina `set_timezone`: la app actualiza `profiles.timezone` directo (RLS "editar propio" + trigger). `create_couple` ya no recibe zona.
Alternativa descartada: guardar zona en `couple_members`. El perfil existe antes de emparejarse y la zona es de la persona, no de la relación.

### Helper `user_today(uid) returns date`
`(app_now() at time zone p.timezone)::date`. Reemplaza `couple_now()` en check-ins, protector, nudges del día y `today_state`.

### Cierre: `d < least(today(flame), today(sky))`
En `close_due_days`, por pareja: `v_close_until := least(user_today(flame), user_today(sky))`. Se cierran rachas y días de pareja mientras `d < v_close_until`. Desaparece la condición `d = v_today and v_now::time >= deadline_on(...)`. Así, el día D cierra a la medianoche del más atrasado; el cron de 5 min da como máximo 5 min de retraso, igual que hoy. Rachas semanales: domingo D se cierra con la misma regla.

### Guard de check-in
- INSERT: `local_date := user_today(auth.uid())`; rechaza si `local_date <= s.closed_through` (`day_closed`). Esto cubre el viaje al oeste.
- DELETE: rechaza si `old.local_date <> user_today(auth.uid())` o si `old.local_date <= s.closed_through`.
- Se quita la comparación con la hora límite.

Lo mismo aplica a `use_freeze`: protege `user_today(auth.uid())` si `> closed_through`.

### `deadline` → `reminder_time`
`alter table streaks rename column deadline to reminder_time`, backfill `reminder_time := deadline - interval '2 hours'` (mismo momento en que hoy sale la push), y `drop pending_deadline, pending_from` + `drop function deadline_on`. El cron de recordatorios elige, por miembro, las rachas con `reminder` activo cuya `reminder_time` ya pasó en la zona del miembro, que no ha cumplido en su `user_today` y sin push enviada ese día (la dedupe actual pasa a usar la fecha local del miembro).

### Desfase visible: `prev`
Si voy adelantado, mi "ayer" sigue abierto hasta la medianoche de mi pareja y los contadores aún no lo incluyen. Sin corregirlo, el conteo bajaría un día en mi pantalla durante esas horas. `today_state` trae por racha diaria `prev = { due, protected, done }` cuando `closed_through < hoy − 1`, y la UI lo suma (o lo trata como ruptura) en el conteo de la racha y en la racha en pareja. Las semanales esperan al cierre (`ponytail:` en el SQL).

### `today_state`
`today` = fecha local de quien consulta; `done`/`week_count` se calculan para esa fecha (incluye la de la pareja, que es la regla de specs/daily-check-in). Se añaden `timezone` (la de quien consulta, reemplaza `couple.timezone`) y `members[].today` para que la UI muestre "ya va en mañana" cuando `partner.today > today`. `deadline`/`next_deadline` salen; entra `reminder_time`.

### Front
- `time.ts`: `msUntil(deadline, tz)` → `msUntilMidnight(tz)`; usa `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Al iniciar sesión / volver a primer plano: si la zona del dispositivo ≠ `me.timezone`, llamar `set_timezone` e invalidar `today`.
- `StreakForm`: "Hora límite" → "Hora del recordatorio"; se quita el toast "aplica desde mañana".
- Perfil: se quita "Detectar con GPS" y `@photostructure/tz-lookup`; se muestra la zona actual solo como texto.

## Risks / Trade-offs

- [El día de la pareja tarda hasta 26 h en cerrar si las zonas están muy separadas, así que la racha en pareja "sube" tarde para el adelantado] → Es lo correcto según la regla. La UI del adelantado muestra su propio día; el conteo se actualiza al cerrar.
- [Viajar al este acorta el día y podría hacerte perder uno] → Aceptado, igual que en Duolingo.
- [Migración con usuarios reales en medio de un día] → Correr la migración y luego `close_due_days()`. Como los días se cierran después que antes (medianoche ≥ hora límite), no se rompe ninguna racha por la migración.
- [Rollback] → La migración es destructiva en `couples.timezone`/`pending_*`. Respaldar con `pg_dump` de `couples` y `streaks` antes de aplicar.

## Migration Plan

1. Migración `…_per_user_tz.sql`: columna en perfiles + backfill, renombre/backfill de `reminder_time`, drops, funciones nuevas (`user_today`, `set_timezone`, `create_couple`, `check_in_guard`, `close_due_days`, `use_freeze`, `today_state`, recordatorios).
2. Regenerar `database.types.ts`.
3. Desplegar front que sincroniza zona; el front viejo seguirá llamando con la firma anterior de `create_couple`, así que se despliegan juntos.
