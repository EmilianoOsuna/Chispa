# streak-alerts Specification

## Purpose
Evita que la racha se apague: alerta "Racha en peligro" con cuenta regresiva, toques entre la pareja, protectores de racha y notificaciones push.

## Requirements

### Requirement: Pantalla Racha en peligro
Cuando una racha Juntos exigible hoy ya fue cumplida por la pareja, el usuario no la ha cumplido y faltan 2 horas o menos para la medianoche del usuario, la app SHALL mostrar al abrirse (una vez por racha y día) la pantalla "Racha en peligro": llama asustada temblando, "¡No dejes que se apague!", mensaje con los días en juego, cuenta regresiva hasta la medianoche del usuario en horas/minutos/segundos actualizándose cada segundo, estado de ambos (el pendiente con pulso), último toque recibido, botón para marcar y botón para usar protector.

#### Scenario: Abrir la app en peligro
- **WHEN** Emi abre la app a las 22:13 de su zona con "Ejercicio" cumplido solo por Hanna
- **THEN** ve Racha en peligro con cuenta regresiva 01:47:xx y el toque más reciente de Hanna

#### Scenario: Marcar desde peligro
- **WHEN** Emi toca "Ya hice ejercicio"
- **THEN** se registra el check-in y pasa a la pantalla de celebración

#### Scenario: Cerrar
- **WHEN** Emi toca cerrar
- **THEN** vuelve a Hoy y no se muestra de nuevo esa pantalla para esa racha ese día

### Requirement: Toques
Un miembro SHALL poder enviar a su pareja un toque con texto opcional (máx. 140 caracteres) desde una racha pendiente de la pareja. El receptor SHALL verlo en la app en vivo y recibir una notificación push si las tiene activas. Se limita a 1 toque por racha cada 10 minutos por emisor.

#### Scenario: Enviar toque
- **WHEN** Hanna envía "¡Vamos, son solo 20 minutos!" en la racha Ejercicio
- **THEN** Emi recibe una push "Hanna te mandó un toque" y el mensaje aparece en la pantalla Racha en peligro

#### Scenario: Límite de toques
- **WHEN** Hanna intenta enviar otro toque en la misma racha antes de 10 minutos
- **THEN** el envío se rechaza y el botón muestra cuándo puede volver a tocar

### Requirement: Protector de racha
La pareja SHALL ganar 1 protector por cada 7 días perfectos consecutivos, con máximo 2 acumulados. Usar un protector sobre una racha y día SHALL marcar ese día como protegido: no rompe la racha ni de la racha ni la racha en pareja, pero no suma chispas. Se usa sobre la fecha local de quien lo activa y solo mientras ese día no se haya cerrado.

#### Scenario: Usar protector
- **WHEN** Emi toca "Usar protector de racha · 1 disponible" en Racha en peligro
- **THEN** el día queda protegido, el contador de protectores baja a 0 y la racha se conserva al cerrar el día

#### Scenario: Sin protectores
- **WHEN** la pareja tiene 0 protectores
- **THEN** el botón aparece deshabilitado indicando cuántos días perfectos faltan para el siguiente

### Requirement: Notificaciones push
Al activar notificaciones, la app SHALL pedir permiso del navegador y registrar la suscripción del dispositivo. Para cada racha con recordatorio activo, el sistema SHALL enviar una push a la hora del recordatorio, en la zona de cada miembro, a cada miembro que no ha cumplido en su fecha local, como máximo una por racha, persona y día. Tocar la notificación SHALL abrir la app en la racha correspondiente.

#### Scenario: Recordatorio
- **WHEN** son las 21:30 en la zona de Emi, "Dormir" tiene recordatorio a las 21:30 y Emi no lo ha marcado
- **THEN** Emi recibe una sola push con el nombre de la racha y los días en juego

#### Scenario: Recordatorio en otra zona
- **WHEN** Hanna está en Europe/Madrid y la misma racha tiene recordatorio a las 21:30
- **THEN** Hanna lo recibe a las 21:30 de Madrid, no a las 21:30 de CDMX

#### Scenario: Ya cumplió
- **WHEN** Hanna ya marcó la racha antes del recordatorio
- **THEN** Hanna no recibe la push

#### Scenario: iOS no instalada
- **WHEN** el usuario usa iOS Safari sin haber instalado la PWA
- **THEN** el interruptor de notificaciones explica que hay que añadirla a la pantalla de inicio primero
