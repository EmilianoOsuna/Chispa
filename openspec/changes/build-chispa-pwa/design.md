## Context

Repo greenfield: solo existe `openspec/`. La fuente de verdad visual es el canvas de diseño (5 artboards de 390×844 en HTML con estilos inline): paleta, tipografías, sombras sólidas y 4 animaciones CSS ya definidas (`chispaShake`, `chispaPulse`, `chispaBounce`, `chispaFall`). La mascota es un SVG de dos trazos (llama naranja exterior, azul interior) con caras distintas por estado. Ver proposal.md para el porqué y specs/ para el comportamiento.

## Goals / Non-Goals

**Goals:**
- Reproducir el diseño pixel a pixel en móvil y que las animaciones se sientan "vivas" (resortes, no solo easing lineal).
- Toda regla de negocio que importe (cierre de día, conteos, chispas, protectores, aislamiento) vive en Postgres, no en el cliente.
- Cero servidores propios: Supabase + hosting estático.

**Non-Goals:**
- App nativa / tiendas (solo PWA).
- Check-ins offline con cola de sincronización (offline = solo lectura).
- Escritorio como objetivo de diseño: en pantallas anchas la app se centra en una columna de 430px máx.
- i18n: solo español.
- Más de 2 personas por pareja, chat, historial de toques más allá del último relevante.

## Decisions

### 1. React 19 + Vite + TypeScript (SPA), no Next.js
Es una app detrás de login, sin SEO ni SSR: un SPA estático es más simple de cachear como PWA y de hospedar. Next añadiría servidor/edge sin beneficio. SvelteKit sería válido, pero el ecosistema de animación de React (Motion) es el más maduro para lo que pide el diseño.

### 2. Animación: Motion (`motion/react`) + CSS keyframes del diseño
- **Bucles** (llama respirando/rebotando/temblando, pulso, confeti): se portan tal cual los `@keyframes` del canvas a CSS. Corren en el compositor, cero JS por frame.
- **Interacción y estado** (relleno con resorte del check, conteo de números, `AnimatePresence` entre rutas, entrada escalonada de listas, pantalla de celebración): Motion, por resortes físicos, `layout` y animaciones de salida que CSS no da.
- `<MotionConfig reducedMotion="user">` + `@media (prefers-reduced-motion)` que apaga los keyframes en bucle.
- Confeti: ~16 `div` con `chispaFall` y delays aleatorios (como el diseño). Sin `canvas-confetti`, Lottie ni Rive: la mascota ya es SVG y sus caras son `<path>` intercambiables.

### 3. Estilos: Tailwind v4 con tokens del diseño
`@theme` en `src/index.css` con los colores, radios y fuentes del canvas (`--color-ink`, `--color-flame`, `--color-flame-deep`, `--color-sky`, etc.). Las sombras "3D" van como utilidad propia (`.press`: `box-shadow: 0 var(--d) 0 <color>`; `:active` → `translateY(var(--d))` y sombra 0). Se elige Tailwind sobre CSS Modules porque el diseño ya está escrito como estilos atómicos inline: la traducción es casi 1:1.

### 4. Fuentes self-hosted
`@fontsource-variable/bricolage-grotesque` y `@fontsource-variable/figtree`, precacheadas por el service worker → funcionan offline y sin FOUT de Google Fonts.

### 5. PWA: `vite-plugin-pwa` (Workbox, `registerType: 'prompt'`)
Precache del shell, `injectManifest` para poder añadir los handlers `push` y `notificationclick` en un SW propio (`src/sw.ts`). Aviso de nueva versión con `useRegisterSW`.

### 5b. Auth: correo + contraseña, cuentas creadas a mano
`signInWithPassword`, registro público desactivado (`disable_signup`). Las dos cuentas se crean en el panel de Supabase. Se descartó el código por correo: en el plan gratis con el SMTP por defecto Supabase no permite editar plantillas (no se puede incluir `{{ .Token }}`) y limita a ~2 correos/hora. Con contraseña no hay correos y el login ocurre dentro de la PWA, también en iOS. La sesión persiste con refresh token hasta cerrar sesión.

### 6. Datos en cliente: supabase-js + TanStack Query (persistido)
Queries por pantalla (`today`, `month`, `achievements`) con `persistQueryClient` en `localStorage` para lectura offline. Mutaciones optimistas para check-in. Realtime: un canal por pareja escuchando `postgres_changes` en `check_ins`, `nudges` y `couple_members` filtrado por `couple_id`; cada evento hace `invalidateQueries` de la query afectada (simple; el relleno animado lo dispara el cambio de props). Router: `react-router` v7 en modo librería.

### 7. Modelo de datos (Postgres)
```
profiles(id → auth.users, name)
couples(id, invite_code unique, timezone, freezes 0..2, best_streak, paired_at, created_at)
couple_members(couple_id, user_id unique, color 'flame'|'sky', joined_at)   -- máx 2 por couple
streaks(id, couple_id, name, icon, frequency 'daily'|'weekdays'|'weekly', weekly_target,
        mode 'together'|'solo', deadline time, reminder bool, archived_at, created_by)
check_ins(id, couple_id, streak_id, user_id, local_date, created_at)  unique(streak_id,user_id,local_date)
streak_days(streak_id, local_date, user_id, done bool, protected bool)   -- cerrados por cron
couple_days(couple_id, local_date, perfect bool, flame_all bool, sky_all bool, protected bool)
streak_counters(streak_id, user_id null=juntos, current, best)
freeze_uses(couple_id, streak_id, local_date, used_by)
nudges(id, couple_id, streak_id, from_user, to_user, kind 'nudge'|'high_five', body, created_at)
achievements(couple_id, code, unlocked_at)  pk(couple_id, code)
push_subscriptions(user_id, endpoint unique, p256dh, auth)
reminders_sent(streak_id, user_id, local_date)  pk
```
`couple_id` se denormaliza en `check_ins`/`nudges` para RLS y filtros de Realtime baratos.

### 8. Reglas de negocio en SQL
- **RLS** en todas las tablas con `is_member(couple_id)` (`security definer`, `stable`). `check_ins` insert/delete solo con `user_id = auth.uid()`.
- **Validación de check-in** en trigger `before insert/delete`: racha activa, exigible en `local_date`, `local_date` = hoy en la tz de la pareja y hora local < `deadline`. El cliente no decide nada de esto.
- **RPCs** `security definer`: `create_couple(tz)`, `join_couple(code)` (con `select … for update` para garantizar máx. 2), `today_state()` (un JSON con todo lo de Hoy: rachas exigibles, estado por persona, conteos actuales = contador cerrado + hoy si ya cumplió, racha en pareja, mejor racha, semana, chispas, protectores, último toque), `month_calendar(year, month)`, `use_freeze(streak_id)`, `send_nudge(streak_id, body, kind)` (rate limit 10 min).
- **Cierre de días**: `close_due_days()` vía pg_cron cada 5 min. Por cada racha cuyo `deadline` del día D ya pasó en la tz de su pareja y D no está en `streak_days`: escribe resultados, actualiza `streak_counters`, y cuando todas las rachas del día de la pareja están cerradas escribe `couple_days`, actualiza `best_streak`, otorga protector cada 7 días perfectos y logros. Idempotente (claves únicas + `on conflict do nothing`).
- **Por qué materializar** y no calcular el conteo recorriendo `check_ins` en cada lectura: el conteo depende de frecuencia, modo, fines de semana y protectores; calcularlo una vez al cerrar el día deja las lecturas en O(1) y el calendario en un `select` directo de `couple_days`.
- **Chispas**: vista `couple_sparks` derivada de `check_ins` (10 por check-in + 10 por miembro cuando ambos cumplen la racha ese día). Sin columna de saldo → no hay nada que manipular.

### 9. Push: Edge Function `push` + pg_net
- `push_reminders`: pg_cron cada 5 min invoca la Edge Function (vía `pg_net` con service role) que busca miembros pendientes con `deadline - 2h <= ahora`, sin fila en `reminders_sent`, y envía con `npm:web-push` (VAPID en secretos).
- Toques: trigger `after insert on nudges` → `pg_net` a la misma función para push inmediata.
- Suscripciones expiradas (410) se borran.
- Click en notificación: el SW abre `/?streak=<id>`; Hoy decide si muestra Racha en peligro.

### 10. Zona horaria y fechas
`couples.timezone` se toma de `Intl.DateTimeFormat().resolvedOptions().timeZone` al crear la pareja. Servidor: `now() at time zone tz`. Cliente: un util de ~20 líneas con `Intl.DateTimeFormat({ timeZone })` para "hoy" y la cuenta regresiva. Sin date-fns.

### 11. Estructura
```
src/
  main.tsx  App.tsx  sw.ts  index.css
  lib/        supabase.ts  queries.ts  time.ts  realtime.ts
  components/ Flame.tsx (mood: idle|happy|scared)  StreakRow.tsx  Week.tsx  PersonDot.tsx  TabBar.tsx  Confetti.tsx  Count.tsx
  screens/    Login  Onboarding  Today  NewStreak  Danger  Celebration  Us  Profile
supabase/
  migrations/  functions/push/  tests/ (pgTAP)
```
Sin capa de "services"/"repositories": las pantallas llaman a hooks de `queries.ts`.

### 12. Pruebas
La lógica crítica está en SQL, así que la prueba va ahí: pgTAP (`supabase test db`) para cierre de días (diario, entre semana, X por semana, juntos/cada quien, protector), límite de 2 miembros y RLS entre parejas. En cliente solo `time.ts` con Vitest. UI se valida manualmente contra el canvas.

## Risks / Trade-offs

- [Push en iOS solo funciona con la PWA instalada (iOS 16.4+)] → onboarding y Perfil explican "Añadir a pantalla de inicio"; la pantalla Racha en peligro funciona igual al abrir la app.
- [pg_cron cada 5 min ⇒ un día puede cerrarse hasta 5 min tarde] → el trigger de check-in ya rechaza tras el `deadline`, así que el retraso solo afecta cuándo se actualiza el contador, no el resultado.
- [Cambiar `deadline` a mitad de día puede reabrir/cerrar el día] → la edición aplica desde el día siguiente (guardar `deadline_next` o validar contra la hora vigente al inicio del día). Elegido: el cambio surte efecto al día siguiente.
- [Zona horaria fija por pareja; si viajan, el día sigue la tz original] → aceptable; Perfil permite cambiarla después (fuera de alcance inicial).
- [Invalidar queries en cada evento Realtime genera refetch] → con 2 usuarios y pocos eventos es irrelevante; pasar a `setQueryData` si se nota.
- [Animaciones pesadas en gama baja] → solo `transform`/`opacity`, sin `filter`/`box-shadow` animados excepto el pulso (1 elemento).

## Migration Plan

Greenfield. Despliegue: 1) crear proyecto Supabase, `supabase db push`, habilitar `pg_cron` y `pg_net`, cargar secretos VAPID, `supabase functions deploy push`; 2) en Auth, Site URL, registro público desactivado y crear las dos cuentas en el panel; 3) desplegar el build estático en Cloudflare (Worker con assets estáticos, modo SPA) con `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`/`VITE_VAPID_PUBLIC_KEY`. Rollback: redeploy del build anterior; migraciones solo aditivas.

## Open Questions

- Textos exactos de notificaciones y del estado vacío.
- Set definitivo de logros más allá de los 5 iniciales.
