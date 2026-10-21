## ADDED Requirements

### Requirement: Zona horaria automática por persona
Cada persona SHALL tener su propia zona horaria IANA, tomada del dispositivo. Al abrir la app, si la zona del dispositivo es distinta a la guardada, el sistema SHALL actualizarla sin pedir nada al usuario. Un cambio de zona MUST NOT reabrir ni permitir check-ins en un día que ya se cerró.

#### Scenario: Primera vez
- **WHEN** Hanna abre la app por primera vez en un teléfono configurado en Europe/Madrid
- **THEN** su zona queda en Europe/Madrid y su día cierra a la medianoche de Madrid

#### Scenario: Viaje
- **WHEN** Emi viaja de America/Mexico_City a America/Tijuana y abre la app
- **THEN** su zona se actualiza a America/Tijuana sin intervención

#### Scenario: Viaje al oeste tras el cierre
- **WHEN** el día 20 ya se cerró para la pareja y un cambio de zona hace que la fecha local de Emi vuelva a ser 20
- **THEN** Emi no puede marcar ni deshacer check-ins del 20

## REMOVED Requirements

### Requirement: Zona horaria por GPS
**Reason**: La zona se toma automáticamente del dispositivo y es por persona, no por pareja.
**Migration**: Se quita el botón "Detectar con GPS" de Perfil; la zona de cada miembro arranca con la zona que tenía la pareja y se actualiza sola al abrir la app.
