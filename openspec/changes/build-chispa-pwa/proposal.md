## Why

Chispa existe hoy solo como diseño (canvas "Chispa — rachas en pareja": pantallas Hoy, Racha extendida, Racha en peligro, Nueva racha y Nosotros). Hay que convertirlo en una PWA instalable y funcional donde una pareja mantiene rachas de hábitos compartidas, conservando exactamente el look and feel (paleta naranja/azul/navy, Bricolage Grotesque + Figtree, botones "3D" con sombra sólida) y las animaciones vivas (llama que rebota/tiembla, confeti, pulso), con Supabase como backend para no operar servidores propios.

## What Changes

- Nueva PWA (greenfield) en el repo: React + Vite + TypeScript, Tailwind con los tokens del diseño, Motion para animaciones, instalable y con app shell offline.
- Backend en Supabase: Auth (correo + código de 6 dígitos), Postgres con RLS por pareja, Realtime para ver en vivo cuando la pareja marca, Edge Functions + pg_cron para recordatorios push.
- Emparejamiento: un usuario crea la pareja y comparte un código de 6 caracteres; el otro se une tecleándolo. Máximo 2 miembros; cada uno tiene su color (naranja / azul).
- Rachas: crear racha con nombre, ícono, frecuencia (diario / entre semana / X por semana), modo (Juntos / Cada quien), hora límite y recordatorio.
- Check-in diario: marcar la racha de hoy, ver el estado de ambos, contador de racha de pareja, mejor racha y semana actual; celebración animada al extender la racha.
- Racha en peligro: pantalla con cuenta regresiva cuando la pareja ya cumplió y tú no, "toques" (mensajes de ánimo) y protector de racha.
- Notificaciones Web Push: recordatorio antes de la hora límite y aviso de toque recibido.
- Nosotros: % de cumplimiento del mes por persona, calendario mensual (los dos / solo uno), logros por hitos y saldo de chispas.

**Supuestos registrados** (no definidos en el diseño): la pestaña Perfil es mínima (nombre, código de invitación, notificaciones, cerrar sesión); el día se calcula en la zona horaria de la pareja; chispas = +10 por check-in propio y +10 extra cuando ambos completan; se gana 1 protector cada 7 días perfectos (máx. 2); los check-ins requieren conexión (offline solo lectura).

## Capabilities

### New Capabilities
- `couple-pairing`: autenticación, perfil y emparejamiento de dos personas mediante código de invitación.
- `streaks`: creación y configuración de rachas (frecuencia, modo Juntos/Cada quien, hora límite, recordatorio) y cálculo de racha actual/mejor.
- `daily-check-in`: pantalla Hoy, marcar check-ins, estado en vivo de la pareja, contador de pareja y celebración.
- `streak-alerts`: racha en peligro con cuenta regresiva, toques, protector de racha y notificaciones push.
- `couple-progress`: pantalla Nosotros con cumplimiento mensual, calendario, logros y chispas.
- `pwa-shell`: instalabilidad, offline del app shell, navegación inferior, sistema visual y animaciones del diseño con soporte de movimiento reducido.

### Modified Capabilities
(ninguna; no hay specs existentes)

## Impact

- Código nuevo: app frontend completa en la raíz del repo (`src/`, `public/`, config de Vite/Tailwind/PWA).
- Supabase: proyecto nuevo, migraciones SQL (`supabase/migrations/`), 1 Edge Function (`send-reminders`), job de pg_cron, secretos VAPID.
- Dependencias: `react`, `react-router`, `@supabase/supabase-js`, `@tanstack/react-query`, `motion`, `tailwindcss`, `vite-plugin-pwa`, `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/figtree`, `web-push` (solo en la Edge Function).
- Hosting estático (Vercel/Netlify/Cloudflare Pages) con HTTPS, requisito para PWA y push.
