## Why

Los íconos de la UI son paths SVG dibujados a mano en `Icon.tsx`. Son inconsistentes entre sí y cada ícono nuevo hay que dibujarlo. Un set estandarizado da trazos uniformes y un catálogo grande sin trabajo extra.

## What Changes

- Reemplazar los paths de `src/components/Icon.tsx` por íconos de **Lucide** (`lucide-react`), conservando la API `<Icon name=... />` y los ids de ícono de racha guardados en la BD (`agua`, `ejercicio`, `dormir`, `leer`, `meditar`, `comer`).
- Reemplazar el `<svg>` inline del check en `PersonDot` (`src/components/bits.tsx`) por el ícono `Check` de Lucide.
- La mascota `Flame.tsx` (llama con cara) **no cambia**.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
<!-- ninguna: el comportamiento no cambia, solo el dibujo de los íconos (skip_specs: true) -->

## Impact

- Nueva dependencia: `lucide-react`.
- Archivos: `src/components/Icon.tsx`, `src/components/bits.tsx`.
- Sin cambios en BD ni en las pantallas que usan `<Icon>`.
