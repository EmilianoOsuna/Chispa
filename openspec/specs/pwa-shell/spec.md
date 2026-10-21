# pwa-shell Specification

## Purpose
Define el contenedor de la app: instalación como PWA, funcionamiento offline del shell, navegación y la fidelidad visual y de movimiento al diseño de Chispa.

## Requirements

### Requirement: Instalable
La app SHALL cumplir los criterios de instalación de PWA en Chrome/Android y iOS Safari: manifest con nombre "Chispa", íconos (incluido maskable y apple-touch-icon) con la llama naranja/azul, `display: standalone`, color de tema y fondo del diseño, y servida por HTTPS.

#### Scenario: Instalar en Android
- **WHEN** el usuario abre la app en Chrome Android
- **THEN** puede instalarla y se abre a pantalla completa sin barra del navegador

### Requirement: Shell offline
El app shell (HTML, JS, CSS, fuentes, íconos) SHALL quedar en caché para abrir sin conexión mostrando los últimos datos conocidos y un indicador de "sin conexión". Las escrituras SHALL requerir conexión.

#### Scenario: Abrir sin red
- **WHEN** el usuario abre la PWA instalada en modo avión
- **THEN** ve la pantalla Hoy con los últimos datos y el aviso sin conexión

### Requirement: Actualización de versión
Cuando haya una versión nueva desplegada, la app SHALL ofrecer recargar con un aviso no intrusivo, sin perder la sesión.

#### Scenario: Nueva versión
- **WHEN** se despliega una versión nueva y el usuario tiene la app abierta
- **THEN** aparece un aviso "Nueva versión disponible" con botón para actualizar

### Requirement: Navegación inferior
Las pantallas principales SHALL tener una barra inferior fija con Hoy, Nosotros, Logros y Perfil (cada una con su propia pantalla) (ícono + texto, la activa resaltada en su color) que respete el área segura del dispositivo. Las pantallas Nueva racha, Racha en peligro y Racha extendida SHALL mostrarse a pantalla completa sin barra.

#### Scenario: Cambiar de pestaña
- **WHEN** el usuario toca "Nosotros"
- **THEN** la pantalla cambia con transición animada y la pestaña Nosotros queda resaltada en azul

### Requirement: Fidelidad visual al diseño
La interfaz SHALL reproducir el diseño de referencia: paleta (fondo #F3F5FA, tinta #14213D, naranja #FF8A2A/#FF9A45/#C2410C, azul #2563EB/#1A47B8/#1D4ED8, línea #E3E8F2, texto secundario #5A6785), tipografías Bricolage Grotesque (títulos y números) y Figtree (texto), radios generosos, botones y tarjetas con sombra sólida inferior ("3D") que se hunden al presionar, e íconos de trazo. Las fuentes SHALL servirse desde la propia app (sin depender de Google Fonts en tiempo de ejecución). Los objetivos táctiles SHALL medir al menos 44px y el texto cumplir contraste 4.5:1.

#### Scenario: Botón presionado
- **WHEN** el usuario presiona un botón primario
- **THEN** el botón baja hasta cubrir su sombra sólida y regresa al soltar

### Requirement: Animaciones vivas
La app SHALL animar: la llama de la mascota (respiración sutil en Hoy, rebote en celebración, temblor en peligro), confeti en celebración, pulso en la fila pendiente en peligro, relleno con resorte de los indicadores al marcar, conteo animado de números al cambiar, transiciones entre pantallas y entrada escalonada de las listas. Las animaciones SHALL correr a 60 fps en un teléfono de gama media y usar solo transform/opacity.

#### Scenario: Movimiento reducido
- **WHEN** el sistema operativo tiene activado "reducir movimiento"
- **THEN** las animaciones en bucle y el confeti se desactivan y las transiciones se reducen a fundidos cortos, sin perder información
