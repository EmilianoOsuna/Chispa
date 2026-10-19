## Purpose

Permite que dos personas inicien sesión, tengan un perfil y se emparejen para compartir rachas; todo dato de la app pertenece a una pareja.

## ADDED Requirements

### Requirement: Inicio de sesión con correo y contraseña
El sistema SHALL autenticar con correo y contraseña. Las cuentas MUST crearse solo desde el panel de Supabase (registro público desactivado): la app es para dos personas. El sistema SHALL mantener la sesión indefinidamente en el dispositivo hasta cerrar sesión, incluso al reabrir la PWA instalada.

#### Scenario: Login exitoso
- **WHEN** el usuario ingresa su correo y contraseña correctos
- **THEN** queda autenticado y llega a la pantalla Hoy (o al onboarding si no tiene pareja)

#### Scenario: Credenciales incorrectas
- **WHEN** el correo o la contraseña no coinciden
- **THEN** no inicia sesión y se indica "Correo o contraseña incorrectos"

#### Scenario: Registro bloqueado
- **WHEN** alguien intenta crear una cuenta nueva desde la API pública
- **THEN** el registro es rechazado

#### Scenario: Sesión persistente
- **WHEN** el usuario autenticado cierra y vuelve a abrir la PWA
- **THEN** sigue autenticado sin pedir credenciales de nuevo

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

### Requirement: Usar la app antes de que se una la pareja
Quien crea la pareja SHALL poder usar la app completa de inmediato (crear rachas, marcar, ver progreso) sin esperar a su pareja. Mientras esté sola, la pantalla Hoy SHALL mostrar el código de invitación con opción de compartirlo y de activar el aviso por push. Las rachas cuentan con un solo miembro; al unirse la pareja, el historial no se reinicia y en las rachas Juntos hereda el conteo actual.

#### Scenario: Empezar sola
- **WHEN** Emi crea la pareja y Hanna aún no tiene cuenta
- **THEN** Emi llega a Hoy, ve la tarjeta "Esperando a tu pareja" con el código y puede crear y marcar rachas

#### Scenario: La pareja se une
- **WHEN** Hanna se une con el código
- **THEN** Emi recibe una push "Hanna se unió a Chispa" (si activó notificaciones) y, con la app abierta, un aviso en vivo; la tarjeta de invitación desaparece sin recargar

### Requirement: Aislamiento de datos por pareja
El sistema MUST impedir que un usuario lea o modifique datos (rachas, check-ins, toques, estadísticas) de una pareja a la que no pertenece, aplicado en la base de datos y no solo en el cliente.

#### Scenario: Acceso ajeno
- **WHEN** un usuario autenticado consulta rachas de otra pareja con la API directamente
- **THEN** no recibe ningún registro y cualquier escritura es rechazada

### Requirement: Avatar personalizable
Cada persona SHALL poder elegir en Perfil un avatar DiceBear entre 6 estilos (o su inicial), sobre su color, y generar otra variante con "Otro". El avatar SHALL mostrarse en Hoy, Racha en peligro y Nosotros, y la pareja SHALL ver el cambio en vivo.

#### Scenario: Cambiar avatar
- **WHEN** Emi elige el estilo "Aventura" en Perfil
- **THEN** su avatar cambia en todas las pantallas y Hanna lo ve actualizado sin recargar

### Requirement: Zona horaria por GPS
La pareja SHALL poder fijar su zona horaria desde Perfil con "Detectar con GPS": la app lee la ubicación del dispositivo y la convierte a la zona IANA correspondiente, que se usa para el cierre de días y las horas límite.

#### Scenario: Detectar zona
- **WHEN** Emi está en Mazatlán y toca "Detectar con GPS"
- **THEN** la zona de la pareja queda en America/Mazatlan

#### Scenario: Sin permiso de ubicación
- **WHEN** el usuario niega el permiso de ubicación
- **THEN** la zona no cambia y se indica que no se pudo leer la ubicación

### Requirement: Perfil mínimo
La pestaña Perfil SHALL mostrar nombre editable, código de invitación (si la pareja está incompleta), interruptor de notificaciones y cerrar sesión.

#### Scenario: Cerrar sesión
- **WHEN** el usuario toca "Cerrar sesión"
- **THEN** se borra la sesión local y vuelve a la pantalla de login
