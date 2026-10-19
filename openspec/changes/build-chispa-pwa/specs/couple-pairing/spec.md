## Purpose

Permite que dos personas inicien sesión, tengan un perfil y se emparejen para compartir rachas; todo dato de la app pertenece a una pareja.

## ADDED Requirements

### Requirement: Inicio de sesión por correo y código
El sistema SHALL autenticar usuarios con un código de 6 dígitos enviado a su correo, sin contraseña ni enlaces, introducido dentro de la propia app; el código SHALL ser de un solo uso y caducar en 1 hora. El sistema SHALL mantener la sesión indefinidamente en el dispositivo hasta cerrar sesión, incluso al reabrir la PWA instalada.

#### Scenario: Login exitoso
- **WHEN** el usuario ingresa su correo y luego teclea el código recibido
- **THEN** queda autenticado y llega a la pantalla Hoy (o al onboarding si no tiene pareja)

#### Scenario: Código incorrecto o caducado
- **WHEN** el usuario teclea un código erróneo o caducado
- **THEN** no inicia sesión, se indica el error y puede pedir un código nuevo

#### Scenario: Sesión persistente
- **WHEN** el usuario autenticado cierra y vuelve a abrir la PWA
- **THEN** sigue autenticado sin pedir email de nuevo

### Requirement: Perfil con nombre y color
Cada usuario SHALL tener un nombre visible y su inicial; dentro de la pareja, al creador se le asigna naranja (#FF8A2A) y a quien se une azul (#2563EB). Ese color SHALL identificar a la persona en toda la app (avatares, check-ins, calendario).

#### Scenario: Primer ingreso
- **WHEN** un usuario nuevo inicia sesión por primera vez
- **THEN** el sistema le pide su nombre antes de continuar

### Requirement: Crear pareja e invitar
Un usuario sin pareja SHALL poder crear una y obtener un código de invitación de 6 caracteres, con botón para copiarlo. Unirse a una pareja SHALL ser posible únicamente tecleando ese código (sin enlaces de invitación).

#### Scenario: Crear pareja
- **WHEN** un usuario sin pareja elige "Crear pareja"
- **THEN** se crea la pareja con él como único miembro y se muestra el código con botón para copiarlo

### Requirement: Unirse a una pareja
Un usuario sin pareja SHALL poder unirse con un código válido. Una pareja SHALL tener como máximo 2 miembros y un usuario SHALL pertenecer a una sola pareja.

#### Scenario: Código válido
- **WHEN** el usuario ingresa un código de una pareja con 1 miembro
- **THEN** queda unido, ambos ven la misma pantalla Hoy y el creador ve el cambio en vivo

#### Scenario: Pareja llena o código inválido
- **WHEN** el código no existe o la pareja ya tiene 2 miembros
- **THEN** el sistema rechaza la unión con un mensaje claro y no modifica ninguna pareja

### Requirement: Aislamiento de datos por pareja
El sistema MUST impedir que un usuario lea o modifique datos (rachas, check-ins, toques, estadísticas) de una pareja a la que no pertenece, aplicado en la base de datos y no solo en el cliente.

#### Scenario: Acceso ajeno
- **WHEN** un usuario autenticado consulta rachas de otra pareja con la API directamente
- **THEN** no recibe ningún registro y cualquier escritura es rechazada

### Requirement: Perfil mínimo
La pestaña Perfil SHALL mostrar nombre editable, código de invitación (si la pareja está incompleta), interruptor de notificaciones y cerrar sesión.

#### Scenario: Cerrar sesión
- **WHEN** el usuario toca "Cerrar sesión"
- **THEN** se borra la sesión local y vuelve a la pantalla de login
