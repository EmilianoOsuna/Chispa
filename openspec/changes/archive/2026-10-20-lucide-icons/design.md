## Context

`Icon.tsx` expone `Icon({ name, size, stroke })` con un mapa `PATHS` de ~25 nombres. Los ids de ícono de racha (`agua`…`comer`) están restringidos por un `check` en `streaks.icon`.

## Goals / Non-Goals

**Goals:** mismo API de `<Icon>`, mismos nombres, aspecto Lucide.

**Non-Goals:** cambiar la mascota `Flame.tsx`, agregar íconos de racha nuevos o tocar la BD.

## Decisions

- **`lucide-react` sobre copiar paths a mano**: tree-shaking por import nombrado, así que solo se empaquetan los íconos usados. Los paths actuales ya imitan el estilo Lucide (24×24, stroke redondo), así que el cambio visual es mínimo. Alternativa descartada: Heroicons/Phosphor, que tienen otro estilo de trazo y no traen equivalentes tan directos (`Dumbbell`, `Droplet`).
- **`Icon.tsx` queda como mapa `nombre -> componente Lucide`**: `size` y `stroke` pasan a `size` y `strokeWidth`. Los callers no cambian.
- **Mapeo**: agua→`Droplet`, ejercicio→`Dumbbell`, dormir→`Moon`, leer→`BookOpen`, meditar→`Flower2`, comer→`Apple`, check→`Check`, plus→`Plus`, back→`ChevronLeft`, close→`X`, spark→`Sparkles`, clock→`AlarmClock`, pending→`Clock`, flame→`Flame`, people→`Users`, trophy→`Trophy`, user→`User`, shield→`Shield`, shieldCheck→`ShieldCheck`, hand→`Hand`, bell→`Bell`, copy→`Copy`, chevronLeft→`ChevronLeft`, chevronRight→`ChevronRight`, archive→`Archive`.

## Risks / Trade-offs

- [Lucide renombra íconos entre versiones] → Fijar la versión en `package.json`; `tsc` truena si un import desaparece.
- [Grosor visual distinto en tamaños chicos] → Revisar en el navegador la TabBar y `PersonDot` y ajustar `strokeWidth` si hace falta.
