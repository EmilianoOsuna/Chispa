## Purpose

Define cómo la pareja crea y configura rachas de hábitos y cómo se calcula el conteo actual y la mejor racha de cada una y de la pareja.

## ADDED Requirements

### Requirement: Crear racha
Cualquier miembro SHALL poder crear una racha con: nombre (1–60 caracteres), ícono de un set fijo (Agua, Ejercicio, Dormir, Leer, Meditar, Comer sano), frecuencia, modo, hora límite y recordatorio activado o no. La racha pertenece a la pareja y ambos la ven.

#### Scenario: Encender racha
- **WHEN** el usuario completa el formulario "Nueva racha" y toca "Encender racha"
- **THEN** la racha aparece en "Rachas de hoy" para ambos miembros con 0 días

#### Scenario: Nombre vacío
- **WHEN** el usuario intenta crear una racha sin nombre
- **THEN** el botón no envía y se indica que falta el nombre

### Requirement: Frecuencias
El sistema SHALL soportar: "Diario" (cada día), "Entre semana" (lunes a viernes; sábado y domingo no cuentan ni rompen) y "X por semana" (meta de 1–6 días por semana lunes–domingo; la racha se mide en semanas cumplidas).

#### Scenario: Fin de semana en racha entre semana
- **WHEN** nadie marca el sábado ni el domingo una racha "Entre semana"
- **THEN** el conteo se mantiene y el lunes vuelve a ser día exigible

#### Scenario: X por semana
- **WHEN** una racha 3 por semana tiene 3 check-ins válidos en la semana
- **THEN** esa semana cuenta como cumplida y el conteo se muestra en semanas

### Requirement: Modos Juntos y Cada quien
En modo "Juntos" un periodo SHALL contar solo si ambos miembros cumplieron; si uno falla la racha se reinicia para los dos. En modo "Cada quien" cada miembro SHALL tener su propio conteo y ver el del otro.

#### Scenario: Juntos, uno falla
- **WHEN** en una racha Juntos solo un miembro marcó un día exigible y el día cierra
- **THEN** el conteo de la racha vuelve a 0 para ambos

#### Scenario: Cada quien, uno falla
- **WHEN** en una racha Cada quien solo Emi marcó y el día cierra
- **THEN** el conteo de Emi sube y el de su pareja vuelve a 0

### Requirement: Hora límite y cierre del día
Cada racha SHALL tener una hora límite (por defecto 23:59) en la zona horaria de la pareja; después de ella no se aceptan check-ins para ese día. Un día exigible sin cumplir SHALL romper la racha solo al pasar su hora límite, nunca antes.

#### Scenario: Check-in tarde
- **WHEN** un miembro intenta marcar después de la hora límite del día
- **THEN** el check-in se rechaza y la app indica que el día ya cerró

### Requirement: Conteo actual y mejor racha
El sistema SHALL calcular para cada racha el conteo actual y la mejor racha histórica, y para la pareja la "racha en pareja": días consecutivos en los que ambos cumplieron todas las rachas exigibles ese día (días protegidos cuentan; días sin rachas exigibles no rompen).

#### Scenario: Superar la mejor racha
- **WHEN** el conteo de pareja supera la mejor racha
- **THEN** la mejor racha se actualiza al nuevo valor

### Requirement: Editar y archivar
Un miembro SHALL poder editar nombre, ícono, hora límite y recordatorio de una racha, y archivarla. Un cambio de hora límite surte efecto a partir del día siguiente. Cambiar frecuencia o modo no está permitido después de crearla. Una racha archivada deja de mostrarse y de exigirse, pero su historial sigue contando en estadísticas.

#### Scenario: Archivar
- **WHEN** un miembro archiva una racha
- **THEN** desaparece de "Rachas de hoy" para ambos y no afecta la racha en pareja desde ese día
