# daily-check-in Specification

## Purpose
Cubre la pantalla Hoy: marcar las rachas del día, ver en vivo el estado de la pareja y celebrar cuando la racha se extiende.

## Requirements

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

### Requirement: Actualización en vivo
Cuando la pareja marca o desmarca, la pantalla Hoy abierta SHALL actualizarse en menos de 3 segundos sin recargar, con la misma animación de relleno.

#### Scenario: Pareja marca mientras miro
- **WHEN** Hanna marca "Leer" mientras Emi tiene Hoy abierta
- **THEN** el indicador azul de Emi se rellena con animación sin intervención

### Requirement: Celebración al extender la racha
Cuando un check-in completa una racha para el periodo (en Juntos: el segundo miembro), el sistema SHALL mostrar a quien lo hizo la pantalla "Racha extendida": llama rebotando, confeti, el nuevo conteo grande, mensaje "¡Racha en pareja!", semana actual, chispas ganadas, botón "Seguir" y "Chocar las cinco" con la pareja. Chocar las cinco SHALL enviar un toque a la pareja.

#### Scenario: Segundo en marcar
- **WHEN** Emi marca "Ejercicio" y Hanna ya lo había marcado
- **THEN** Emi ve la pantalla de celebración con el conteo nuevo (p. ej. 48)

#### Scenario: Chocar las cinco
- **WHEN** Emi toca "Chocar las cinco con Hanna"
- **THEN** Hanna recibe un toque de tipo choque de manos

### Requirement: Chispas
Cada check-in propio SHALL sumar 10 chispas al usuario y, cuando ambos completan una racha en el periodo, 10 extra a cada uno. Deshacer un check-in SHALL restar lo que otorgó. El saldo mostrado en Hoy es el de la pareja (suma de ambos).

#### Scenario: Completar juntos
- **WHEN** Hanna ya marcó y Emi marca la misma racha hoy
- **THEN** la celebración muestra "+20 chispas" para Emi y el saldo de la pareja suma 40 en total por ese día y racha (10 + 10 propios, 10 + 10 extra)
