# MecanicaSaas

Sistema de gestión para un taller mecánico: registro de vehículos y reparaciones, inventario de repuestos, facturación (con IVA), y un dashboard de seguimiento. Compuesto por tres subproyectos independientes que comparten el mismo modelo de dominio.

## Arquitectura

Monorepo sin build tool a nivel raíz — cada subproyecto se construye y corre por separado.

| Subproyecto | Stack | Rol |
|---|---|---|
| `backend/` | Spring Boot 4.1.1 (Java 17), PostgreSQL (Supabase), Flyway, Spring Security + JWT | API REST, única fuente de verdad del dominio |
| `frontend-web/` | React 19 + TypeScript + Vite, Tailwind CSS v4, react-router-dom | Dashboard web: clientes, órdenes, inventario, empleados |
| `appmovil/` | Flutter | App para recepción: registrar cliente/vehículo al llegar al taller, con escaneo de placa (OCR) |

Las tres apps comparten el mismo modelo de dominio (nombres en español): `Cliente`, `Vehiculo`, `Usuario`, `OrdenDeTrabajo`, `Producto`, `ItemOrden`, `MovimientoInventario`, `Factura`. Los endpoints devuelven las entidades directamente (sin DTOs) — las relaciones vienen anidadas completas en las respuestas (`GET`), pero solo como `{ "id": N }` en los cuerpos de creación/actualización (`POST`/`PUT`).

## Funcionalidades implementadas

- **Órdenes de trabajo**: registro de vehículo/cliente, diagnóstico, estado (`RECIBIDO → EN_DIAGNOSTICO → EN_REPARACION → LISTO → ENTREGADO`), ítems de repuesto/mano de obra.
- **Inventario**: productos con stock mínimo, descuento automático de stock al agregar un repuesto a una orden, reversión + registro de movimiento al eliminarlo.
- **Facturación**: suma de repuestos + mano de obra, IVA 15% (Ecuador), una factura por orden, estados PENDIENTE/PAGADA. *(Nota: calcula el total correcto pero todavía no es un comprobante fiscalmente válido ante el SRI — eso es un futuro proyecto aparte: firma electrónica, XML, RIDE.)*
- **Autenticación y roles**: login JWT (`POST /api/auth/login`), roles `DUENO` / `MECANICO` / `RECEPCIONISTA`. Solo `DUENO` puede crear y listar usuarios (`/api/usuarios`). El resto de la API requiere sesión, sin restricción adicional por rol.
- **Dashboard web**: conectado a la API real (sin datos mock) — clientes, vehículos/órdenes, inventario, empleados (gestión de usuarios, solo visible para DUENO).
- **App móvil**: login, buscar/crear cliente, escanear placa con la cámara (OCR) para buscar o registrar el vehículo, crear la orden inicial.

### En progreso / pendiente

- Reportes de facturación (totales por mes y por mecánico).
- Probar appmovil en un dispositivo/emulador Android real (el entorno de desarrollo no tiene SDK/dispositivo disponible).
- Facturación electrónica SRI (comprobantes electrónicos válidos ante el fisco ecuatoriano).

## Cómo correr cada subproyecto

### Backend

```bash
cd backend
./mvnw spring-boot:run          # levantar la API en localhost:8080
./mvnw test                     # correr tests
```

Requiere un archivo `.env` en `backend/` (gitignored) con:

```
DB_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
DB_USER=postgres
DB_PASSWORD=...
JWT_SECRET_KEY=...
# opcional: siembra la primera cuenta DUENO al arrancar si la tabla usuario está vacía
BOOTSTRAP_ADMIN_EMAIL=...
BOOTSTRAP_ADMIN_PASSWORD=...
```

La base de datos corre en Supabase (Postgres). Las migraciones de Flyway (`src/main/resources/db/migration/`) se aplican automáticamente al arrancar.

### Frontend web

```bash
cd frontend-web
npm install
npm run dev        # dev server en localhost:5173, con CORS ya habilitado en el backend
npm run build       # type-check + build de producción
npm run lint        # oxlint
```

Usa `VITE_API_BASE_URL` para apuntar al backend (por defecto `http://localhost:8080`).

### App móvil

```bash
cd appmovil
flutter pub get
flutter run
```

La URL del backend se configura desde la app (ícono de engranaje) y se persiste localmente. Por defecto apunta a `http://10.0.2.2:8080` (alias del emulador Android hacia `localhost` del host); en iOS simulator usa `http://localhost:8080`; en un celular físico, la IP LAN de la máquina donde corre el backend.

Más detalle de estructura interna y qué está verificado vs. pendiente en `appmovil/README.md`.
