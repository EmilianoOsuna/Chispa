## MODIFIED Requirements

### Requirement: Crear racha
Cualquier miembro SHALL poder crear una racha con: nombre (1–60 caracteres), ícono de un set fijo (Agua, Ejercicio, Dormir, Leer, Meditar, Comer sano), frecuencia, modo, hora del recordatorio y recordatorio activado o no. La racha pertenece a la pareja y ambos la ven.

#### Scenario: Encender racha
- **WHEN** el usuario completa el formulario "Nueva racha" y toca "Encender racha"
- **THEN** la racha aparece en "Rachas de hoy" para ambos miembros con 0 días

#### Scenario: Nombre vacío
- **WHEN** el usuario intenta crear una racha sin nombre
- **THEN** el botón no envía y se indica que falta el nombre

### Requirement: Editar y archivar
Un miembro SHALL poder editar nombre, ícono, hora del recordatorio y recordatorio de una racha, y archivarla. Cambiar frecuencia o modo no está permitido después de crearla. Una racha archivada deja de mostrarse y de exigirse, pero su historial sigue contando en estadísticas.

#### Scenario: Archivar
- **WHEN** un miembro archiva una racha
- **THEN** desaparece de "Rachas de hoy" para ambos y no afecta la racha en pareja desde ese día

#### Scenario: Cambiar hora del recordatorio
- **WHEN** un miembro cambia la hora del recordatorio de 21:30 a 20:00
- **THEN** el cambio aplica desde el siguiente recordatorio, sin aviso de "aplica desde mañana"

## ADDED Requirements

### Requirement: Día de cada persona y cierre a medianoche
Cada persona SHALL tener su propio día calendario en su zona horaria, que termina a las 00:00 de esa zona. Un check-in SHALL contar para la fecha local de quien lo hace. El día D de una racha (y de la racha en pareja) SHALL cerrarse solo cuando D ya terminó para ambos miembros; un día exigible sin cumplir rompe la racha al cerrarse, nunca antes.

#### Scenario: Zonas distintas
- **WHEN** Emi está en America/Mexico_City, Hanna en Europe/Madrid, ambos marcan "Leer" en su propio 20 de octubre y Hanna lo hace a las 23:50 de Madrid
- **THEN** el 20 de octubre cuenta como cumplido por ambos

#### Scenario: Cierre con el más atrasado
- **WHEN** ya es 21 de octubre en Madrid pero en CDMX siguen siendo las 22:00 del 20
- **THEN** el 20 de octubre sigue abierto para la pareja y Emi todavía puede marcar

#### Scenario: Check-in después de medianoche
- **WHEN** Emi marca a las 00:05 del 21 en su zona
- **THEN** el check-in cuenta para el 21, no para el 20

## REMOVED Requirements

### Requirement: Hora límite y cierre del día
**Reason**: El día cierra a la medianoche de cada persona; ya no hay hora límite por racha.
**Migration**: El campo de hora límite pasa a ser la hora del recordatorio (hora límite − 2 h). El cierre se describe en "Día de cada persona y cierre a medianoche".
