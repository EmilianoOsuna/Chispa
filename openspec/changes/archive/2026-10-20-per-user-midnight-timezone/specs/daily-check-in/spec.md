## MODIFIED Requirements

### Requirement: Pantalla Hoy
La pantalla Hoy SHALL mostrar: saldo de chispas y avatares de la pareja; tarjeta principal con la llama, la racha en pareja ("N días en pareja"), la mejor racha y cuántos días faltan para superarla; la semana actual (L–D) del usuario con días cumplidos, hoy y futuros; un aviso con el tiempo restante hasta la medianoche del usuario y cuántas rachas faltan ("faltan X de Y"); y la lista "Rachas de hoy" con las rachas exigibles en la fecha local del usuario.

#### Scenario: Día con rachas pendientes
- **WHEN** la pareja tiene 3 rachas exigibles y 1 completada por ambos
- **THEN** el aviso indica "faltan 2 de 3" y el tiempo hasta la medianoche del usuario

#### Scenario: Pareja sin rachas
- **WHEN** la pareja no tiene rachas activas
- **THEN** se muestra un estado vacío con la llama y un botón para crear la primera racha

### Requirement: Estado por persona en cada racha
Cada fila de racha SHALL mostrar ícono, nombre, conteo y un indicador por miembro en su color: círculo relleno con check si cumplió, anillo vacío si está pendiente, y un subtítulo contextual ("¡completada hoy!", "Hanna ya leyó", "se marca esta noche"). El estado de ambos miembros SHALL referirse a la fecha local de quien mira. Si la pareja ya está en una fecha posterior, su indicador muestra cómo le fue en la fecha de quien mira y se indica "ya va en mañana".

#### Scenario: Solo la pareja cumplió
- **WHEN** Hanna marcó "Leer" y Emi no
- **THEN** Emi ve el indicador azul relleno, el naranja vacío y el subtítulo "Hanna ya leyó"

#### Scenario: Pareja adelantada
- **WHEN** Emi está en su 20 de octubre, Hanna ya está en su 21 y marcó "Leer" el 20 y el 21
- **THEN** Emi ve a Hanna cumplida (por el 20), con la indicación "ya va en mañana", y el check del 21 no se le muestra hasta que Emi esté en su 21

### Requirement: Marcar check-in
El usuario SHALL poder marcar su propio check-in de una racha exigible en su fecha local con un toque, y deshacerlo mientras siga en esa misma fecha local. Un usuario MUST NOT poder marcar por su pareja ni para un día que ya se cerró. El check-in SHALL reflejarse de inmediato en la UI (optimista) y revertirse con aviso si el servidor lo rechaza.

#### Scenario: Marcar
- **WHEN** Emi toca su indicador pendiente en "Ejercicio"
- **THEN** el indicador se rellena con animación, el contador se actualiza y suma chispas

#### Scenario: Sin conexión
- **WHEN** Emi intenta marcar sin conexión
- **THEN** el cambio no se aplica y se muestra que se necesita conexión

#### Scenario: Deshacer después de medianoche
- **WHEN** Emi marcó a las 23:50 y a las 00:10 de su zona intenta deshacerlo
- **THEN** se rechaza porque ese día ya terminó para Emi
