# Graph Report - Chispa  (2026-10-20)

## Corpus Check
- 119 files · ~110,066 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 879 nodes · 1110 edges · 94 communities (82 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d72cd828`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- queries.ts
- App.tsx
- dependencies
- devDependencies
- compilerOptions
- Decisions
- compilerOptions
- 20261019000003_logic.sql
- ADDED Requirements
- ADDED Requirements
- ADDED Requirements
- ADDED Requirements
- StreakForm.tsx
- 20261019000002_rls.sql
- ADDED Requirements
- 20261019000001_schema.sql
- ADDED Requirements
- SKILL.md
- SKILL.md
- SKILL.md
- opsx-explore.md
- explore.md
- opsx-explore.md
- database.types.ts
- plugins
- tasks.md
- proposal.md
- 20261019000005_push.sql
- index.ts
- tsconfig.json
- vite-env.d.ts
- 20261019000004_cron_realtime.sql
- Requirement: Día de cada persona y cierre a medianoche
- Requirement: Notificaciones push
- source-command-opsx-explore
- Decisions
- MODIFIED Requirements
- Requirement: Zona horaria automática por persona
- proposal.md
- proposal.md
- 20261019000007_solo_start.sql
- design.md
- tasks.md
- source-command-opsx-apply
- source-command-opsx-archive
- source-command-opsx-propose
- source-command-opsx-sync
- source-command-opsx-update
- 20261019000008_avatars_tz.sql
- tasks.md
- tasks.md
- tasks.md
- Requirement: Zona horaria automática por persona
- proposal.md
- proposal.md
- tasks.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `react` - 17 edges
3. `useToday()` - 17 edges
4. `compilerOptions` - 15 edges
5. `Today()` - 14 edges
6. `Decisions` - 14 edges
7. `Icon()` - 13 edges
8. `periodDone()` - 12 edges
9. `toast` - 11 edges
10. `isoDow()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `InviteCard()` --calls--> `currentSubscription()`  [EXTRACTED]
  src/components/InviteCard.tsx → src/lib/push.ts
- `Profile()` --calls--> `useToday()`  [EXTRACTED]
  src/screens/Profile.tsx → src/lib/queries.ts
- `Us()` --calls--> `useToday()`  [EXTRACTED]
  src/screens/Us.tsx → src/lib/queries.ts
- `completesPair()` --calls--> `periodDone()`  [EXTRACTED]
  src/screens/Today.tsx → src/lib/queries.ts
- `Onboarding()` --calls--> `deviceTimezone()`  [EXTRACTED]
  src/screens/Onboarding.tsx → src/lib/time.ts

## Import Cycles
- None detected.

## Communities (94 total, 12 thin omitted)

### Community 0 - "queries.ts"
Cohesion: 0.05
Nodes (89): react, Main(), OfflineBanner(), persister, queryClient, Shell(), Toasts(), useOnline() (+81 more)

### Community 1 - "App.tsx"
Cohesion: 0.07
Nodes (28): couple-pairing Specification, Purpose, Requirement: Aislamiento de datos por pareja, Requirement: Avatar personalizable, Requirement: Crear pareja e invitar, Requirement: Inicio de sesión con correo y contraseña, Requirement: Perfil con nombre y color, Requirement: Perfil mínimo (+20 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (37): @dicebear/adventurer, @dicebear/big-smile, @dicebear/core, @dicebear/fun-emoji, @dicebear/lorelei, @dicebear/notionists, @dicebear/thumbs, @fontsource-variable/bricolage-grotesque (+29 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (45): @cloudflare/vite-plugin, oxlint, devDependencies, @cloudflare/vite-plugin, oxlint, supabase, tailwindcss, @tailwindcss/vite (+37 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, vite-plugin-pwa/react, WebWorker, compilerOptions, allowArbitraryExtensions (+18 more)

### Community 5 - "Decisions"
Cohesion: 0.07
Nodes (26): ADDED Requirements, Purpose, Requirement: Aislamiento de datos por pareja, Requirement: Avatar personalizable, Requirement: Crear pareja e invitar, Requirement: Inicio de sesión con correo y contraseña, Requirement: Perfil con nombre y color, Requirement: Perfil mínimo (+18 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 7 - "20261019000003_logic.sql"
Cohesion: 0.11
Nodes (5): check_in_guard, check_in_saved, public.check_in_saved(), public.couple_sparks, streak_after_insert

### Community 8 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): Purpose, Requirement: Conteo actual y mejor racha, Requirement: Crear racha, Requirement: Día de cada persona y cierre a medianoche, Requirement: Editar y archivar, Requirement: Frecuencias, Requirement: Modos Juntos y Cada quien, Requirements (+13 more)

### Community 9 - "ADDED Requirements"
Cohesion: 0.10
Nodes (20): daily-check-in Specification, Purpose, Requirement: Actualización en vivo, Requirement: Celebración al extender la racha, Requirement: Chispas, Requirement: Estado por persona en cada racha, Requirement: Marcar check-in, Requirement: Pantalla Hoy (+12 more)

### Community 10 - "ADDED Requirements"
Cohesion: 0.10
Nodes (19): 10. Zona horaria y fechas, 11. Estructura, 12. Pruebas, 1. React 19 + Vite + TypeScript (SPA), no Next.js, 2. Animación: Motion (`motion/react`) + CSS keyframes del diseño, 3. Estilos: Tailwind v4 con tokens del diseño, 4. Fuentes self-hosted, 5. PWA: `vite-plugin-pwa` (Workbox, `registerType: 'prompt'`) (+11 more)

### Community 11 - "ADDED Requirements"
Cohesion: 0.11
Nodes (18): Purpose, Requirement: Notificaciones push, Requirement: Pantalla Racha en peligro, Requirement: Protector de racha, Requirement: Toques, Requirements, Scenario: Abrir la app en peligro, Scenario: Cerrar (+10 more)

### Community 12 - "StreakForm.tsx"
Cohesion: 0.10
Nodes (31): Avatar(), AvatarProps, COLOR, CONFETTI, Count(), group(), PersonDot(), WeekCell (+23 more)

### Community 13 - "20261019000002_rls.sql"
Cohesion: 0.12
Nodes (13): public.achievements, public.check_ins, public.couple_days, public.couple_members, public.couples, public.freeze_uses, public.nudges, public.profiles (+5 more)

### Community 14 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Actualización en vivo, Requirement: Celebración al extender la racha, Requirement: Chispas, Requirement: Estado por persona en cada racha, Requirement: Marcar check-in, Requirement: Pantalla Hoy (+9 more)

### Community 15 - "20261019000001_schema.sql"
Cohesion: 0.14
Nodes (13): public.achievements, public.check_ins, public.couple_days, public.couple_members, public.couples, public.freeze_uses, public.nudges, public.profiles (+5 more)

### Community 16 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Conteo actual y mejor racha, Requirement: Crear racha, Requirement: Editar y archivar, Requirement: Frecuencias, Requirement: Hora límite y cierre del día, Requirement: Modos Juntos y Cada quien (+9 more)

### Community 17 - "SKILL.md"
Cohesion: 0.17
Nodes (11): Check for context, Ending Discovery, Guardrails, Handling Different Entry Points, OpenSpec Awareness, Planning a Change, The Stance, What You Don't Have To Do (+3 more)

### Community 18 - "SKILL.md"
Cohesion: 0.17
Nodes (11): Check for context, Ending Discovery, Guardrails, Handling Different Entry Points, OpenSpec Awareness, Planning a Change, The Stance, What You Don't Have To Do (+3 more)

### Community 19 - "SKILL.md"
Cohesion: 0.17
Nodes (11): Check for context, Ending Discovery, Guardrails, Handling Different Entry Points, OpenSpec Awareness, Planning a Change, The Stance, What You Don't Have To Do (+3 more)

### Community 20 - "opsx-explore.md"
Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness, Planning a Change, The Stance, What You Don't Have To Do, What You Might Do (+2 more)

### Community 21 - "explore.md"
Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness, Planning a Change, The Stance, What You Don't Have To Do, What You Might Do (+2 more)

### Community 22 - "opsx-explore.md"
Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness, Planning a Change, The Stance, What You Don't Have To Do, What You Might Do (+2 more)

### Community 23 - "database.types.ts"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 24 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 25 - "tasks.md"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Purpose, Requirement: Notificaciones push, Requirement: Pantalla Racha en peligro, Requirement: Protector de racha, Requirement: Toques, Scenario: Abrir la app en peligro, Scenario: Cerrar (+8 more)

### Community 26 - "proposal.md"
Cohesion: 0.12
Nodes (15): Purpose, pwa-shell Specification, Requirement: Actualización de versión, Requirement: Animaciones vivas, Requirement: Fidelidad visual al diseño, Requirement: Instalable, Requirement: Navegación inferior, Requirement: Shell offline (+7 more)

### Community 68 - "Requirement: Día de cada persona y cierre a medianoche"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: Actualización de versión, Requirement: Animaciones vivas, Requirement: Fidelidad visual al diseño, Requirement: Instalable, Requirement: Navegación inferior, Requirement: Shell offline (+6 more)

### Community 69 - "Requirement: Notificaciones push"
Cohesion: 0.13
Nodes (14): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Crear racha, Requirement: Día de cada persona y cierre a medianoche, Requirement: Editar y archivar, Requirement: Hora límite y cierre del día, Scenario: Archivar (+6 more)

### Community 70 - "source-command-opsx-explore"
Cohesion: 0.15
Nodes (12): Check for context, Command Template, Ending Discovery, Guardrails, OpenSpec Awareness, Planning a Change, source-command-opsx-explore, The Stance (+4 more)

### Community 71 - "Decisions"
Cohesion: 0.14
Nodes (13): Cierre: `d < least(today(flame), today(sky))`, Context, `deadline` → `reminder_time`, Decisions, Desfase visible: `prev`, Front, Goals / Non-Goals, Guard de check-in (+5 more)

### Community 72 - "MODIFIED Requirements"
Cohesion: 0.14
Nodes (13): MODIFIED Requirements, Requirement: Notificaciones push, Requirement: Pantalla Racha en peligro, Requirement: Protector de racha, Scenario: Abrir la app en peligro, Scenario: Cerrar, Scenario: iOS no instalada, Scenario: Marcar desde peligro (+5 more)

### Community 73 - "Requirement: Zona horaria automática por persona"
Cohesion: 0.14
Nodes (13): couple-progress Specification, Purpose, Requirement: Calendario mensual, Requirement: Cumplimiento mensual por persona, Requirement: Encabezado de pareja, Requirement: Logros, Requirement: Saldo de chispas, Requirements (+5 more)

### Community 74 - "proposal.md"
Cohesion: 0.12
Nodes (5): profile_timezone_guard, public.couples, public.profile_timezone_guard(), public.profiles, public.streaks

### Community 75 - "proposal.md"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Purpose, Requirement: Calendario mensual, Requirement: Cumplimiento mensual por persona, Requirement: Encabezado de pareja, Requirement: Logros, Requirement: Saldo de chispas, Scenario: Cálculo (+4 more)

### Community 76 - "20261019000007_solo_start.sql"
Cohesion: 0.33
Nodes (3): partner_joined_push, public.couples, public.partner_joined_push()

### Community 77 - "design.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 78 - "tasks.md"
Cohesion: 0.17
Nodes (11): MODIFIED Requirements, Requirement: Estado por persona en cada racha, Requirement: Marcar check-in, Requirement: Pantalla Hoy, Scenario: Deshacer después de medianoche, Scenario: Día con rachas pendientes, Scenario: Marcar, Scenario: Pareja adelantada (+3 more)

### Community 85 - "tasks.md"
Cohesion: 0.40
Nodes (4): Context, Decisions, Goals / Non-Goals, Risks / Trade-offs

### Community 89 - "tasks.md"
Cohesion: 0.25
Nodes (7): 1. Proyecto base, 2. Base de datos, 3. Shell, auth y emparejamiento, 4. Componentes visuales y animación, 5. Pantallas principales, 6. PWA y notificaciones, 7. Despliegue y verificación final

### Community 90 - "Requirement: Zona horaria automática por persona"
Cohesion: 0.25
Nodes (7): ADDED Requirements, REMOVED Requirements, Requirement: Zona horaria automática por persona, Requirement: Zona horaria por GPS, Scenario: Primera vez, Scenario: Viaje, Scenario: Viaje al oeste tras el cierre

### Community 91 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 92 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 93 - "tasks.md"
Cohesion: 0.50
Nodes (3): 1. Base de datos, 2. Front, 3. Integración

## Knowledge Gaps
- **445 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+440 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `react` connect `queries.ts` to `plugins`, `StreakForm.tsx`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _445 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `queries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05467762326169406 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._