## 1. Íconos

- [x] 1.1 Instalar `lucide-react` y verificar que `npm run build` pasa
- [x] 1.2 Reescribir `src/components/Icon.tsx` como mapa `nombre -> componente Lucide` (mapeo en design.md) conservando `IconName`, `STREAK_ICONS` y la firma de `Icon`; verificar con `tsc -b` que ningún caller cambia
- [x] 1.3 Reemplazar el `<svg>` del check en `PersonDot` (`src/components/bits.tsx`) por `Check` de Lucide; verificar que `Flame.tsx` queda intacto (`git diff --stat`)
- [x] 1.4 Revisar en el navegador Hoy, TabBar, Nueva racha (selector de íconos), Racha en peligro y Logros; verificar que todos los íconos se ven y ninguno queda vacío
