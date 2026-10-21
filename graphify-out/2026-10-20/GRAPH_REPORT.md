# Graph Report - Chispa  (2026-10-19)

## Corpus Check
- 88 files · ~86,300 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 565 nodes · 782 edges · 68 communities (63 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `react` - 15 edges
3. `Today()` - 15 edges
4. `compilerOptions` - 15 edges
5. `useToday()` - 14 edges
6. `Decisions` - 14 edges
7. `periodDone()` - 12 edges
8. `toast` - 12 edges
9. `Icon()` - 11 edges
10. `msUntil()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Main()` --calls--> `useCoupleRealtime()`  [EXTRACTED]
  src/App.tsx → src/lib/realtime.ts
- `Profile()` --calls--> `useToday()`  [EXTRACTED]
  src/screens/Profile.tsx → src/lib/queries.ts
- `StreakForm()` --calls--> `useToday()`  [EXTRACTED]
  src/screens/StreakForm.tsx → src/lib/queries.ts
- `completesPair()` --calls--> `periodDone()`  [EXTRACTED]
  src/screens/Today.tsx → src/lib/queries.ts
- `Shell()` --calls--> `useMembership()`  [EXTRACTED]
  src/App.tsx → src/lib/queries.ts

## Import Cycles
- None detected.

## Communities (68 total, 5 thin omitted)

### Community 0 - "queries.ts"
Cohesion: 0.09
Nodes (59): COLOR, CONFETTI, Count(), group(), PersonDot(), Week(), WeekCell, weekCells() (+51 more)

### Community 1 - "App.tsx"
Cohesion: 0.09
Nodes (33): react, Main(), OfflineBanner(), persister, queryClient, Shell(), Toasts(), useOnline() (+25 more)

### Community 2 - "dependencies"
Cohesion: 0.06
Nodes (30): @fontsource-variable/bricolage-grotesque, @fontsource-variable/figtree, motion, dependencies, @fontsource-variable/bricolage-grotesque, @fontsource-variable/figtree, motion, react (+22 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (31): oxlint, devDependencies, oxlint, supabase, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+23 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, vite-plugin-pwa/react, WebWorker, compilerOptions, allowArbitraryExtensions (+18 more)

### Community 5 - "Decisions"
Cohesion: 0.10
Nodes (19): 10. Zona horaria y fechas, 11. Estructura, 12. Pruebas, 1. React 19 + Vite + TypeScript (SPA), no Next.js, 2. Animación: Motion (`motion/react`) + CSS keyframes del diseño, 3. Estilos: Tailwind v4 con tokens del diseño, 4. Fuentes self-hosted, 5. PWA: `vite-plugin-pwa` (Workbox, `registerType: 'prompt'`) (+11 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 7 - "20261019000003_logic.sql"
Cohesion: 0.11
Nodes (5): check_in_guard, check_in_saved, public.check_in_saved(), public.couple_sparks, streak_after_insert

### Community 8 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Aislamiento de datos por pareja, Requirement: Crear pareja e invitar, Requirement: Inicio de sesión por correo y código, Requirement: Perfil con nombre y color, Requirement: Perfil mínimo, Requirement: Unirse a una pareja (+9 more)

### Community 9 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Actualización en vivo, Requirement: Celebración al extender la racha, Requirement: Chispas, Requirement: Estado por persona en cada racha, Requirement: Marcar check-in, Requirement: Pantalla Hoy (+9 more)

### Community 10 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Conteo actual y mejor racha, Requirement: Crear racha, Requirement: Editar y archivar, Requirement: Frecuencias, Requirement: Hora límite y cierre del día, Requirement: Modos Juntos y Cada quien (+9 more)

### Community 11 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Purpose, Requirement: Notificaciones push, Requirement: Pantalla Racha en peligro, Requirement: Protector de racha, Requirement: Toques, Scenario: Abrir la app en peligro, Scenario: Cerrar (+8 more)

### Community 12 - "StreakForm.tsx"
Cohesion: 0.15
Nodes (14): IconName, PATHS, STREAK_ICONS, TabBar(), TABS, Frequency, Icon, Mode (+6 more)

### Community 13 - "20261019000002_rls.sql"
Cohesion: 0.12
Nodes (13): public.achievements, public.check_ins, public.couple_days, public.couple_members, public.couples, public.freeze_uses, public.nudges, public.profiles (+5 more)

### Community 14 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: Actualización de versión, Requirement: Animaciones vivas, Requirement: Fidelidad visual al diseño, Requirement: Instalable, Requirement: Navegación inferior, Requirement: Shell offline (+6 more)

### Community 15 - "20261019000001_schema.sql"
Cohesion: 0.14
Nodes (13): public.achievements, public.check_ins, public.couple_days, public.couple_members, public.couples, public.freeze_uses, public.nudges, public.profiles (+5 more)

### Community 16 - "ADDED Requirements"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Purpose, Requirement: Calendario mensual, Requirement: Cumplimiento mensual por persona, Requirement: Encabezado de pareja, Requirement: Logros, Requirement: Saldo de chispas, Scenario: Cálculo (+4 more)

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
Cohesion: 0.25
Nodes (7): 1. Proyecto base, 2. Base de datos, 3. Shell, auth y emparejamiento, 4. Componentes visuales y animación, 5. Pantallas principales, 6. PWA y notificaciones, 7. Despliegue y verificación final

### Community 26 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

## Knowledge Gaps
- **280 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `plugins`, `queries.ts`, `StreakForm.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `App.tsx`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `queries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09394205443371378 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09468599033816426 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._