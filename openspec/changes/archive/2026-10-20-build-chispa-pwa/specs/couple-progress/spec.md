## Purpose

Cubre las pantallas Nosotros (cumplimiento mensual y calendario de días perfectos) y Logros (insignias y progreso a la siguiente meta).

## ADDED Requirements

### Requirement: Encabezado de pareja
La pantalla Nosotros SHALL mostrar el título y la fecha desde que están juntos en la app ("juntos desde 1 sep", fecha en que se unió el segundo miembro).

#### Scenario: Pareja completa
- **WHEN** la pareja se formó el 1 de septiembre
- **THEN** se muestra "juntos desde 1 sep"

### Requirement: Cumplimiento mensual por persona
El sistema SHALL mostrar una tarjeta por miembro, en su color, con el porcentaje de cumplimiento del mes en curso: check-ins propios realizados entre check-ins exigibles hasta hoy (días cerrados más los ya marcados de hoy), redondeado a entero.

#### Scenario: Cálculo
- **WHEN** Emi tenía 50 check-ins exigibles en el mes y cumplió 46
- **THEN** su tarjeta muestra "92%"

### Requirement: Calendario mensual
El sistema SHALL mostrar el mes en curso en cuadrícula L–D con cada día coloreado: navy si ambos cumplieron todo, naranja/azul si solo uno cumplió todo (color de quien cumplió), borde naranja para hoy, gris para futuros, y neutro para días sin cumplimiento total. Debe incluir la leyenda, el contador de "días perfectos" y etiquetas accesibles por día. El usuario SHALL poder navegar a meses anteriores.

#### Scenario: Día parcial
- **WHEN** el 12 de octubre solo Emi cumplió todas sus rachas
- **THEN** ese día aparece naranja con etiqueta "12 de octubre, solo Emi cumplió todo"

### Requirement: Logros
El sistema SHALL otorgar logros de pareja al alcanzar hitos y mostrarlos en una pantalla propia (pestaña Logros, ruta `/logros`): tarjeta con la siguiente meta, barra de progreso animada y protectores disponibles, y una tarjeta por logro (a color con fecha si está desbloqueado, punteada si no) con su descripción. Hitos iniciales: Primera semana (7 días), 30 noches temprano (30 días en una racha de Dormir), Racha salvada (primer protector usado o toque seguido de check-in), Medio centenar (50), Centenario (100). Un logro desbloqueado no se pierde aunque la racha se reinicie.

#### Scenario: Desbloquear
- **WHEN** la racha en pareja llega a 50
- **THEN** "Medio centenar" pasa a desbloqueado y la siguiente meta es 100

### Requirement: Saldo de chispas
El saldo de chispas de la pareja SHALL ser consistente entre Hoy, la celebración y Nosotros, y SHALL derivarse del historial de check-ins (no editable por el cliente).

#### Scenario: Manipulación
- **WHEN** un cliente intenta escribir directamente su saldo de chispas
- **THEN** la escritura es rechazada
