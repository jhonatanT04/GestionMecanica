# appmovil

App móvil de MecanicaSaas (Flutter) para el flujo de "llegada del auto" en el taller: buscar/crear cliente, escanear la placa del vehículo con la cámara (OCR) para buscarlo o registrarlo, y crear la orden de trabajo inicial (fecha de entrada, kilometraje, problema reportado).

Consume la API REST del backend (Spring Boot) en `/api/clientes`, `/api/vehiculos` y `/api/ordenes`. Sin autenticación todavía (fase posterior) y sin modo offline (siempre hay conexión en el taller).

## Correr la app

```bash
flutter pub get
flutter run
```

La URL del backend se configura desde la app (ícono de engranaje en la pantalla principal) y se persiste localmente. Por defecto apunta a `http://10.0.2.2:8080` (alias del emulador de Android hacia el localhost del host). En iOS simulator usa `http://localhost:8080`; en un celular físico, la IP LAN de la máquina donde corre el backend.

## Estructura

- `lib/models/` — Cliente, Vehiculo, OrdenDeTrabajo, Usuario, EstadoOrden.
- `lib/services/` — cliente HTTP y servicios por entidad.
- `lib/screens/` — pantallas del flujo de nueva orden (búsqueda/creación de cliente, escaneo de placa, búsqueda/creación de vehículo, formulario de orden).
- `lib/config/` — configuración de la URL base de la API.
