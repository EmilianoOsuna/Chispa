## 1. Proyecto base

- [x] 1.1 Crear app Vite React-TS en la raíz e instalar `react-router`, `@supabase/supabase-js`, `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `motion`, `tailwindcss` (`@tailwindcss/vite`), `vite-plugin-pwa`, `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/figtree`, `vitest`; verificar con `npm run build` sin errores
- [x] 1.2 Definir `@theme` en `src/index.css` con la paleta, radios y fuentes del canvas, la utilidad `.press` (sombra sólida que se hunde en `:active`) y los 4 `@keyframes` del diseño (`chispaShake`, `chispaPulse`, `chispaBounce`, `chispaFall`) con su bloque `prefers-reduced-motion`; verificar con una página temporal que muestre botón naranja y azul presionables
- [x] 1.3 Inicializar Supabase local (`supabase init`, `supabase start`) y `.env.local` con `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; verificar que `src/lib/supabase.ts` conecta (`supabase.auth.getSession()` responde)

## 2. Base de datos

- [x] 2.1 Migración con las tablas de design §7, constraints (únicos, checks de enums, `weekly_target` 1–6, nombre 1–60) e índices por `couple_id`; verificar con `supabase db reset` sin errores
- [x] 2.2 Migración de RLS: `is_member(couple_id)` y políticas en todas las tablas; `check_ins` insert/delete solo propio; `couple_sparks`/contadores solo lectura; verificar con prueba pgTAP: usuario de pareja A no lee ni escribe datos de pareja B
- [x] 2.3 RPCs `create_couple(tz)` y `join_couple(code)` (código de 6 caracteres, `for update`, máx. 2, un usuario = una pareja, asigna color flame/sky y `paired_at`); verificar con pgTAP: tercer miembro y código inválido rechazados
- [x] 2.4 Trigger de validación de check-in (racha activa, exigible hoy, fecha = hoy en tz de la pareja, antes del deadline, `user_id = auth.uid()`) también para delete; verificar con pgTAP casos tarde, fin de semana en "entre semana" y check-in por otra persona
- [x] 2.5 Función `close_due_days()` idempotente: llena `streak_days`, actualiza `streak_counters` (diario/entre semana en días, semanal en semanas; juntos/cada quien), `couple_days`, `best_streak`, protector cada 7 días perfectos (máx. 2) y `achievements`; verificar con pgTAP: escenarios de specs/streaks y protector usado no rompe
- [x] 2.6 Vista `couple_sparks` y RPCs `today_state()`, `month_calendar(year, month)`, `use_freeze(streak_id)`, `send_nudge(streak_id, body, kind)` con límite de 10 min; verificar con pgTAP: chispas 10+10 propios +10+10 extra, segundo toque <10 min rechazado, protector con 0 disponibles rechazado
- [x] 2.7 Habilitar `pg_cron`/`pg_net`, programar `close_due_days()` cada 5 min y publicar `check_ins`, `nudges`, `couple_members` en Realtime; verificar con `select * from cron.job` y un evento recibido en la consola del cliente
- [x] 2.8 Generar tipos con `supabase gen types typescript --local > src/lib/database.types.ts`; verificar que `npm run build` tipa las llamadas RPC

## 3. Shell, auth y emparejamiento

- [x] 3.1 `App.tsx`: QueryClient persistido, `MotionConfig reducedMotion="user"`, rutas (`/login`, `/bienvenida`, `/`, `/nosotros`, `/perfil`, `/racha/nueva`, `/racha/:id/peligro`, `/celebracion`), `AnimatePresence` entre rutas, columna máx. 430px y guard de sesión/pareja; verificar navegando que sin sesión redirige a `/login`
- [x] 3.2 `TabBar` (Hoy, Nosotros, Logros → `/nosotros#logros`, Perfil) con `safe-area-inset-bottom` y activo en su color; oculto en pantallas completas; verificar en 390×844 que coincide con el canvas
- [x] 3.3 Pantalla Login con correo + contraseña (`signInWithPassword`) y mensaje de credenciales incorrectas; registro público desactivado; verificar que una cuenta creada en el panel entra y una contraseña errónea muestra error
- [x] 3.4 Onboarding: pedir nombre, crear pareja (código + botón copiar) o unirse tecleando el código; esperar en vivo al segundo miembro; verificar con dos navegadores que el creador ve la unión sin recargar
- [x] 3.5 Pantalla Perfil: editar nombre, código si la pareja está incompleta, interruptor de notificaciones, cerrar sesión; verificar que cerrar sesión regresa a `/login`

## 4. Componentes visuales y animación

- [x] 4.1 `Flame` SVG con `mood` idle (respiración sutil), happy (`chispaBounce`), scared (`chispaShake` + gota), y variante pequeña para el logo; verificar visualmente las 3 caras contra el canvas
- [ ] 4.2 `PersonDot` (relleno con check vs anillo, en color de la persona) con relleno por resorte de Motion, y `Count` (número que anima al cambiar); verificar que con "reducir movimiento" el cambio es instantáneo
- [ ] 4.3 `Week` (L–D: hecho, hoy punteado, futuro), `StreakRow` (ícono, nombre, conteo, subtítulo contextual, dots) con entrada escalonada, y `Confetti` (~16 piezas `chispaFall`); verificar en Chrome DevTools Performance que se mantiene a 60 fps con CPU 4x

## 5. Pantallas principales

- [x] 5.1 `src/lib/time.ts` (hoy y hora local en tz de la pareja, ms hasta el deadline) con prueba Vitest para cambio de día y DST; verificar `npx vitest run`
- [x] 5.2 Pantalla Hoy con `today_state()`: header (chispas, avatares), tarjeta de racha en pareja con mejor racha y semana, aviso "El día cierra en … · faltan X de Y", lista de rachas y estado vacío; verificar fidelidad lado a lado con `Main.dc.html`
- [x] 5.3 Check-in optimista al tocar el propio dot (y deshacer), con rollback + aviso si falla o no hay red; Realtime invalida `today` al marcar la pareja; verificar con dos navegadores que el dot de la pareja se rellena en <3 s
- [x] 5.4 Pantalla Nueva racha (nombre, 6 íconos, frecuencia con meta semanal, Juntos/Cada quien, hora límite, recordatorio, "Encender racha") y edición/archivado desde la fila; verificar que la racha nueva aparece para ambos y que el nombre vacío no envía
- [x] 5.5 Pantalla Racha extendida: se abre cuando el check-in completa la racha del periodo; llama happy, confeti, `Count` grande, semana, "+N chispas", "Seguir" y "Chocar las cinco" (`send_nudge` kind high_five); verificar con dos cuentas que el segundo en marcar la ve
- [x] 5.6 Pantalla Racha en peligro: detección al abrir (juntos, pareja cumplió, yo no, ≤2 h, una vez por racha/día en `localStorage`) o por `?streak=`; cuenta regresiva por segundo, filas con pulso, último toque, marcar, usar protector (deshabilitado con días faltantes) y enviar toque; verificar ajustando un deadline cercano en local
- [x] 5.7 Pantalla Nosotros: encabezado "juntos desde", tarjetas de cumplimiento mensual, calendario con `month_calendar` (colores, leyenda, aria-labels, mes anterior) y logros con siguiente meta; verificar contra `Pareja.dc.html` y que `/nosotros#logros` hace scroll a Logros

## 6. PWA y notificaciones

- [ ] 6.1 Configurar `vite-plugin-pwa` (`injectManifest`, `registerType: 'prompt'`): manifest "Chispa", íconos 192/512/maskable/apple-touch con la llama, theme/background, precache de shell y fuentes; aviso "Nueva versión disponible"; verificar Lighthouse PWA instalable y apertura en modo avión con datos persistidos + aviso sin conexión
- [ ] 6.2 `src/sw.ts`: handlers `push` (título/cuerpo/`data.url`) y `notificationclick` (enfocar o abrir `data.url`); suscripción desde Perfil guardando en `push_subscriptions` y mensaje para iOS no instalada; verificar con push de prueba desde DevTools
- [x] 6.3 Edge Function `push` (`npm:web-push`, VAPID en secretos): modo recordatorios (pendientes a ≤2 h del deadline, dedupe en `reminders_sent`) y modo toque; borrar suscripciones 410; verificar con `supabase functions serve` que un miembro pendiente recibe 1 sola push y el que cumplió ninguna
- [x] 6.4 pg_cron cada 5 min → `pg_net` a `push` (recordatorios) y trigger `after insert on nudges` → `push` (toque); verificar enviando un toque entre dos navegadores y viendo la notificación

## 7. Despliegue y verificación final

- [ ] 7.1 Proyecto Supabase remoto: migraciones, `push` desplegada, secretos VAPID/PUSH_SECRET, Vault, Site URL y registro desactivado; crear las cuentas de Emi y Hanna en el panel; verificar `supabase test db` en verde y login en producción
- [ ] 7.2 Desplegar build estático en Cloudflare (Worker `chispa`, assets SPA) con variables de entorno; verificar instalación en Android (Chrome) e iOS (Safari, Añadir a inicio) y flujo completo con dos teléfonos: emparejar → crear racha → check-in en vivo → celebración → recordatorio push → peligro → protector
