# appmovil

App móvil de MecanicaSaas (Flutter) para el flujo de "llegada del auto" en el taller: login, buscar/crear cliente, escanear la placa del vehículo con la cámara (OCR) para buscarlo o registrarlo, y crear la orden de trabajo inicial (fecha de entrada, kilometraje, problema reportado).

Consume la API REST del backend (Spring Boot) en `/api/auth/login`, `/api/clientes`, `/api/vehiculos` y `/api/ordenes`. Requiere sesión (login con email/password contra `/api/auth/login`; el token se manda como `Authorization: Bearer` en el resto de llamadas). Cualquier rol autenticado (DUEÑO/MECÁNICO/RECEPCIONISTA) puede usar el flujo de nueva orden — no hay gating por rol todavía. Sin modo offline (siempre hay conexión en el taller).

La sesión (token + usuario) se persiste localmente, así que no hay que loguearse cada vez que se abre la app. Si el backend responde 401 en cualquier llamada (token vencido/inválido), la app limpia la sesión y regresa a login automáticamente — no se valida vencimiento del token del lado del cliente.

## Correr la app

```bash
flutter pub get
flutter run
```

La URL del backend se configura desde la app (ícono de engranaje en la pantalla principal) y se persiste localmente. Por defecto apunta a `http://10.0.2.2:8080` (alias del emulador de Android hacia el localhost del host). En iOS simulator usa `http://localhost:8080`; en un celular físico, la IP LAN de la máquina donde corre el backend.

## Estructura

- `lib/models/` — Cliente, Vehiculo, OrdenDeTrabajo, Usuario, EstadoOrden.
- `lib/services/` — cliente HTTP, `AuthService`, `SessionStorage` y servicios por entidad.
- `lib/screens/` — login, pantallas del flujo de nueva orden (búsqueda/creación de cliente, escaneo de placa, búsqueda/creación de vehículo, formulario de orden).
- `lib/config/` — configuración de la URL base de la API.

## Verificado vs. pendiente

Verificado en este entorno (sin SDK de Android ni dispositivo/emulador disponibles):
- `flutter analyze` sin issues y `flutter test` (7/7) cubriendo: detección de placa por OCR, pantalla de login sin sesión guardada, y arranque directo a Home con sesión guardada en `shared_preferences`.
- Revisión manual del flujo de código: login → guarda token+usuario → `HomeScreen`; logout limpia sesión y vuelve a login; cualquier 401 fuera del login dispara el mismo logout vía `ApiClient.onUnauthorized`.

Pendiente de probar en un dispositivo/emulador real contra el backend levantado:
- Login real contra `/api/auth/login` con credenciales válidas/inválidas (mensajes de error tal cual los devuelve el backend).
- Que el token persista entre reinicios de la app y que un 401 real (p. ej. token vencido) regrese a login correctamente.
- Calidad del OCR de placas con placas reales del taller.
