## Why

Hoy la pareja comparte una sola zona horaria y cada racha cierra a una "hora límite" propia. Si cada quien vive en una zona distinta, a uno de los dos el día le cierra a mitad de la madrugada o le empieza en la tarde. Queremos que funcione como Duolingo: el día de cada quien termina a **su** medianoche, sin importar dónde viva su pareja.

## What Changes

- **BREAKING** La zona horaria pasa de la pareja a cada persona y se toma automáticamente del dispositivo al abrir la app.
- El día de cada persona cierra a la medianoche de su zona. El día D de la pareja (rachas Juntos, racha en pareja, Cada quien) se cierra cuando D ya terminó para los dos.
- **BREAKING** Se elimina la "hora límite" por racha. Ese campo pasa a ser la **hora del recordatorio** push, en la zona de cada miembro.
- Un cambio de zona (viaje) nunca reabre un día que ya se cerró.
- En Hoy, el estado de la pareja se muestra para **tu** fecha. Si tu pareja ya va en el día siguiente, se indica con "ya va en mañana".
- Se elimina "Detectar con GPS" y la dependencia `@photostructure/tz-lookup`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `streaks`: crear/editar sin hora límite; el cierre del día pasa a medianoche por persona.
- `daily-check-in`: el aviso de Hoy cuenta hasta tu medianoche; el check-in usa tu fecha local; estado de la pareja para tu fecha.
- `streak-alerts`: Racha en peligro y protector usan tu medianoche; el recordatorio push sale a la hora elegida en la zona de cada quien.
- `couple-pairing`: se quita la zona por GPS y entra la zona automática por persona.

> Estas capacidades viven todavía en `build-chispa-pwa` (sin archivar). Ese change se archiva antes que este para que los deltas apliquen sobre `openspec/specs/`.

## Impact

- BD: `profiles.timezone` (nueva), `couples.timezone` (se elimina), `streaks.deadline`/`pending_deadline`/`pending_from` (se reemplazan por `reminder_time`); funciones `set_timezone`, `create_couple`, `check_in_guard`, `close_due_days`, `today_state`, `use_freeze`, recordatorios push.
- Front: `src/lib/time.ts`, `queries.ts`, `Today.tsx`, `Danger.tsx`, `StreakForm.tsx`, `StreakRow.tsx`, `Profile.tsx`, `Onboarding.tsx`.
- Tests: `supabase/tests/02_close_days.sql`, `src/lib/time.test.ts`.
- Dependencias: se quita `@photostructure/tz-lookup`.
