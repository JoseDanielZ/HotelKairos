# DIFF: Migración del backend al contrato del swagger de referencia (`swaggerjj.json`)

> **Contexto.** `swaggerjj.json` (de un compañero, validado por el profesor) se toma como contrato de verdad. Hay que llevar `Microservicio.Booking` (.NET) y `Frontend.Booking` (Vue) a ese contrato. `swagger.json` se regenera solo al construir el backend, no se edita a mano.
>
> Este documento NO modifica código. Es la lista exhaustiva de cambios concretos requeridos, dividida en fases. Sirve para revisar el alcance antes de tocar nada.

---

## 1. Resumen ejecutivo

| Área | Tu API actual | API de referencia | Impacto |
|---|---|---|---|
| Convención DTO | `XxxDTO`, `XxxCreateRequest`, `XxxUpdateRequest`, `XxxFilterDTO` | `XxxResponse`, `CrearXxxRequest`, `ActualizarXxxRequest` (en español) | Renombre masivo de DTOs |
| Wrapper paginado | `XxxDataPageResult` (con `data`, `pageNumber`, `pageSize`, `totalCount`, `totalPages`) | `XxxPaginatedResponse` (con `items`, `paginaActual`, `limite`, `totalResultados`, `totalPaginas`, `tieneSiguiente`, `tieneAnterior`) | Cambia el contrato de listas |
| Wrapper API | `ApiResponse<T>` con `success`, `message`, `data`, `errors[]` | `XxxApiResponse` con `data`, `success`, `message` (sin `errors[]`) | Errores se manejan vía `ApiErrorResponse` separado (con `status`, `message`, `detail`, `errors{}`) |
| Param de ruta | `{guid}` genérico | `{sucursalGuid}`, `{clienteGuid}`, `{reservaGuid}`, `{habitacionGuid}`, `{usuarioGuid}`, `{rolGuid}`, `{tipoHabitacionGuid}`, `{cargoGuid}`, `{facturaGuid}`, `{pagoGuid}`, `{valoracionGuid}`, `{auditoriaGuid}`, `{estadiaGuid}`, `{catalogoGuid}` | Renombre de cada path con parámetro |
| Auth | `/api/v1/internal/auth/*` + endpoint `/me` | `/api/v1/auth/*` (sin `/internal`) — sin `/me` | Mover rutas, eliminar `/me`, ajustar `userContext` del front |
| Endpoints `/publico` paralelos | Existen `/internal/clientes`, `/internal/sucursales/publico`, `/internal/habitaciones/publico`, `/internal/tipos-habitacion/publico`, `/internal/usuarios/{guid}/publico`, etc. | No existen — se reemplazan por `/api/v1/accommodations/*` y `/api/v1/public/*` específicos | Eliminar todos los `*/publico` |
| Sub-recursos nuevos | No existen | Imágenes de sucursal, amenidades de tipo habitación, imágenes de tipo habitación, roles↔permisos, usuarios↔roles, reserva↔habitaciones, factura↔detalle, factura↔pagos | Entidades, repos y endpoints nuevos |
| Funcionalidad nueva | No existe | Mantenimiento de estadía, anular cargo, generar factura simulada con pago, upload central de imágenes, búsqueda de disponibilidad, resumen rating de sucursal, responder valoración | Servicios + controllers nuevos |

---

## 2. Cambios de auth (Fase 1 — bloqueante para todo lo demás)

### Rutas
| Actual | Nuevo |
|---|---|
| `POST /api/v1/internal/auth/login` | `POST /api/v1/auth/login` |
| `POST /api/v1/internal/auth/refresh` | `POST /api/v1/auth/refresh` |
| `POST /api/v1/internal/auth/logout` | `POST /api/v1/auth/logout` |
| `POST /api/v1/internal/auth/cambiar-password` | `POST /api/v1/auth/cambiar-password` |
| `GET  /api/v1/internal/auth/me` | **Eliminado** |

### `LoginRequest`
| Actual | Nuevo |
|---|---|
| `userName` (camelCase con N mayúscula) | `username` |
| `password` | `password` |

### `LoginResponse`
| Actual | Nuevo |
|---|---|
| `userName`, `nombreCompleto`, `correoElectronico`, `activo`, `roles[]`, `token`, `expirationUtc` | `token`, `refreshToken`, `expiration`, `usuarioId`, `usuarioGuid`, `username`, `email`, `roles[]` |

### `MeResponse` / endpoint `/me`
- Eliminar el endpoint y el DTO `MeResponse` / `MeResponseApiResponse`.
- El frontend ya recibe todo lo que necesita en `LoginResponse` (incluye `usuarioGuid`, `username`, `email`, `roles`).

### `RefreshTokenRequest` (nuevo)
```json
{ "refreshToken": "string" }
```

### Cambios de código backend
- [AuthController.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Controllers/V1/AuthController.cs): cambiar la ruta base de `[Route("api/v1/internal/auth")]` a `[Route("api/v1/auth")]`. Eliminar el action `Me()`.
- DTOs en `Microservicio.HotelLuxemburgo.Business/DTOs/Auth/`: cambiar `LoginRequest.UserName → Username`, reescribir `LoginResponse` (agregar `RefreshToken`, `Expiration`, `UsuarioId`, `UsuarioGuid`; renombrar `CorreoElectronico → Email`; eliminar `Activo`, `NombreCompleto`). Eliminar `MeResponse`. Crear `RefreshTokenRequest`.
- `IUsuarioService`/`AuthService`: emitir refresh token al hacer login. Si todavía no se generan refresh tokens, hay que añadir la columna `refresh_token` y `refresh_token_expires_at` a `usuario_app` (migración EF) y la lógica de rotación en `/refresh`.

### Cambios de código frontend
- [src/services/auth*](Frontend.Booking/src/services/) (probablemente dentro de [stores/auth.ts](Frontend.Booking/src/stores/auth.ts)): cambiar URL `/api/v1/internal/auth/...` → `/api/v1/auth/...`.
- [src/models/auth.models.ts](Frontend.Booking/src/models/auth.models.ts): actualizar `LoginRequest.userName` → `username`; `LoginResponse` agregar `refreshToken`, `expiration`, `usuarioId`, `usuarioGuid`, `email`; eliminar `userName`, `correoElectronico`, `activo`, `nombreCompleto`, `expirationUtc`.
- [src/stores/userContext.ts](Frontend.Booking/src/stores/userContext.ts): eliminar la llamada a `/api/v1/internal/auth/me`. El `idCliente`/`usuarioGuid` ahora viene en `LoginResponse` directamente; persistir el `LoginResponse` completo en `localStorage['booking.login']` y leer de ahí.
- [src/api/http.ts](Frontend.Booking/src/api/http.ts): el endpoint que hoy se "salta" (`isLoginUrl`) hay que ajustarlo a la nueva URL. Posible nuevo interceptor para refresh-token.
- [CLAUDE.md](Frontend.Booking/CLAUDE.md): actualizar la sección de Pinia stores → describir que `userContext` ya no llama a `/me`.

---

## 3. Renombre de parámetros de ruta (Fase 2)

Cada controller debe renombrar `{guid}` al parámetro específico de la entidad. Esto NO cambia tipos (siguen siendo `Guid`), solo nombres y la firma de los actions.

| Entidad | Actual | Nuevo |
|---|---|---|
| Auditoría | `{guid}` | `{auditoriaGuid}` |
| Catálogo servicios | `{guid}` | `{catalogoGuid}` |
| Cliente | `{guid}` | `{clienteGuid}` |
| Estadía | `{guid}` | `{estadiaGuid}` |
| Factura | `{guid}` | `{facturaGuid}` |
| Habitación | `{guid}` | `{habitacionGuid}` |
| Pago | `{guid}` | `{pagoGuid}` |
| Reserva | `{guid}` | `{reservaGuid}` |
| Rol | `{guid}` | `{rolGuid}` |
| Sucursal | `{guid}` | `{sucursalGuid}` |
| Tarifa | `{guid}` | `{tarifaGuid}` |
| Tipo habitación | `{guid}` | `{tipoHabitacionGuid}` |
| Usuario | `{guid}` | `{usuarioGuid}` |
| Valoración | `{guid}` | `{valoracionGuid}` |
| Cargo de estadía | (no existe) | `{cargoGuid}` |

Frontend: `src/services/*.ts` cada llamada `api.get(\`/api/v1/internal/clientes/${guid}\`)` queda como está (la URL no cambia, solo el placeholder en swagger), pero los modelos DTO sí.

---

## 4. Eliminación de endpoints `/publico` paralelos (Fase 3)

La API actual tiene un patrón `entidad/publico` que duplica la entidad para uso público (sin auth). El swagger de referencia consolida esto en `/api/v1/accommodations/*` y `/api/v1/public/*`.

### Endpoints a ELIMINAR
- `GET /api/v1/internal/catalogo-servicios/publico`
- `GET /api/v1/internal/habitaciones/publico`
- `GET /api/v1/internal/habitaciones/{guid}/publico`
- `GET /api/v1/internal/sucursales/publico`
- `GET /api/v1/internal/sucursales/{guid}/publico`
- `GET /api/v1/internal/tipos-habitacion/publico`
- `GET /api/v1/internal/tipos-habitacion/{guid}/publico`
- `GET /api/v1/internal/usuarios/{guid}/publico` (nunca debió existir)
- `GET /api/v1/internal/valoraciones/publicas/sucursal/{idSucursal}`
- `GET /api/v1/internal/roles/activos`
- `GET /api/v1/internal/clientes/{guid}/publico` (si existe)
- `GET /api/v1/public/habitaciones/{habitacionGuid}` (reemplazado por `/api/v1/public/sucursales/{sucursalGuid}/habitaciones`)
- `GET /api/v1/public/sucursales/{sucursalGuid}` (reemplazado por `/api/v1/accommodations/{sucursalGuid}`)
- `GET /api/v1/public/tipos-habitacion/{tipoHabitacionGuid}` (no existe en referencia)
- `GET /api/v1/public/usuarios/{usuarioGuid}` (no existe en referencia)
- `GET /api/v1/public/roles/{rolGuid}` (no existe en referencia)

### Endpoints LEGACY a eliminar (alojamientos)
- `GET /api/v1/alojamientos/{id}`
- `PUT /api/v1/alojamientos/{id}`
- `DELETE /api/v1/alojamientos/{id}`
- `POST /api/v1/alojamientos`
- `POST /api/v1/alojamientos/buscar`

→ Eliminar `AlojamientosController.cs`, `AlojamientoService.cs`, `IAlojamientoService.cs`, `Microservicio.HotelLuxemburgo.Business/DTOs/` modelo `AlojamientoFilterDTO`, `AlojamientoResponseDTO`, `CreateAlojamientoDTO`, `UpdateAlojamientoDTO`. Eliminar [src/services/alojamientos.ts](Frontend.Booking/src/services/alojamientos.ts) y [src/models/alojamiento.models.ts](Frontend.Booking/src/models/alojamiento.models.ts).

### Controllers Public a eliminar (carpeta entera)
- [Controllers/V1/Public/HabitacionesPublicController.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Controllers/V1/Public/HabitacionesPublicController.cs)
- [Controllers/V1/Public/RolesPublicController.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Controllers/V1/Public/RolesPublicController.cs)
- [Controllers/V1/Public/SucursalesPublicController.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Controllers/V1/Public/SucursalesPublicController.cs)
- [Controllers/V1/Public/TiposHabitacionPublicController.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Controllers/V1/Public/TiposHabitacionPublicController.cs)
- [Controllers/V1/Public/UsuariosPublicController.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Controllers/V1/Public/UsuariosPublicController.cs)

Las funciones públicas se concentran en:
- `AccommodationsController` (ya existe) → todos los GET de marketplace.
- `ReservasPublicController` (NUEVO) → `POST /api/v1/public/reservas`.
- `HabitacionesPublicController` (NUEVO, con la nueva ruta `/api/v1/public/sucursales/{sucursalGuid}/habitaciones`).

---

## 5. Endpoints NUEVOS a implementar (Fase 4 — el grueso del trabajo)

### 5.1 Cargos de estadía (parcial → completo)

| Método | Ruta | Tag | Notas |
|---|---|---|---|
| GET | `/api/v1/internal/cargos-estadia/{cargoGuid}` | CargosEstadia | Detalle de cargo |
| PATCH | `/api/v1/internal/cargos-estadia/{cargoGuid}/anular` | CargosEstadia | Anular con motivo |

DTOs nuevos: `CargoEstadiaResponse`, `CargoEstadiaResponseApiResponse`, `CargoEstadiaResponseListApiResponse`, `AnularCargoBody { motivo: string }`.

Backend: extender `CargosEstadiaController.cs` (ya existe) con estos dos actions. Servicio nuevo o extender `EstadiaService` con `ObtenerCargo(Guid)` y `AnularCargo(Guid, string motivo)`. Repo: agregar `CargoEstadiaRepository` con queries por `CargoGuid`.

Frontend: nuevo `src/services/cargos.ts` o agregar a [estadias.ts](Frontend.Booking/src/services/estadias.ts).

### 5.2 Estadías — mantenimiento

| Método | Ruta | Tag |
|---|---|---|
| PATCH | `/api/v1/internal/estadias/{estadiaGuid}/mantenimiento` | Estadias |

Body: marca la estadía/habitación como en mantenimiento (estado especial). Hay que agregar el estado a la entidad de estadía si no existe.

### 5.3 Facturas — endpoints faltantes

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/facturas/reserva/{idReserva}` | Facturas |
| GET | `/api/v1/internal/facturas/{facturaGuid}/detalle` | Facturas |
| POST | `/api/v1/internal/facturas/final-y-pago-simulado/{reservaGuid}` | Facturas |
| GET | `/api/v1/internal/facturas/{facturaGuid}/pagos` | Facturas |

DTOs nuevos: `FacturaDetalleResponse`, `FacturaDetalleResponseListApiResponse`, `FacturaYCierreSimResponse`, `FacturaYCierreSimResponseApiResponse`, `FacturaResponseListApiResponse`.

Backend: la entidad `FacturaDetalleEntity` ya existe. Hay que exponerla. El "final y pago simulado" es un flujo de stored procedure que cierra la factura final + registra un pago simulado. Confirmar con el SP en BD.

### 5.4 Habitaciones — disponibilidad

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/habitaciones/disponibles` | Habitaciones |
| GET | `/api/v1/internal/habitaciones/disponibilidad` | Habitaciones |
| GET | `/api/v1/public/sucursales/{sucursalGuid}/habitaciones` | HabitacionesPublic |

Filtros: `sucursalGuid`, `tipoHabitacionGuid`, `fechaEntrada`, `fechaSalida`, `numAdultos`, `numNinos`.

DTOs nuevos: `HabitacionPublicListItemDto`, `HabitacionResponseIReadOnlyListApiResponse`, `AvailabilityByRoomTypeDto`, `AccommodationAvailabilityDto`.

Backend: query nueva en `HabitacionRepository` con join a `ReservaHabitacion` + `Estadia` para excluir las ocupadas en el rango. Servicio: `HabitacionService.ObtenerDisponibles(...)`. Frontend nuevo método en [habitaciones.ts](Frontend.Booking/src/services/habitaciones.ts).

### 5.5 Imágenes — upload central

| Método | Ruta | Tag |
|---|---|---|
| POST | `/api/v1/internal/images/upload` | Images |

Recibe `multipart/form-data`, devuelve `ImageUploadResponse { url, publicId, width, height, format, bytes }` (estilo Cloudinary).

Backend: nuevo controller `ImagesController.cs`, servicio `IImageStorageService` que envuelve un proveedor (Cloudinary o disco local). En appsettings agregar config (`ImageStorage:Provider`, `ImageStorage:CloudinaryUrl`, etc.).

Frontend: nuevo `src/services/images.ts` con `uploadImage(file: File)`. Reemplazar todos los inputs de URL pegada (sucursal, tipo habitación) por un componente de upload que llame primero a `/images/upload` y use la URL devuelta.

### 5.6 Reservas — sub-recurso habitaciones

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/reservas/{reservaGuid}/habitaciones` | Reservas |
| POST | `/api/v1/internal/reservas/{reservaGuid}/habitaciones` | Reservas |
| DELETE | `/api/v1/internal/reservas/{reservaGuid}/habitaciones/{id}` | Reservas |

DTOs: `ReservaHabitacionRequest`, `ReservaHabitacionResponse`, `ReservaHabitacionResponseApiResponse`. Permite añadir/quitar habitaciones a una reserva existente sin recrear toda la reserva.

Backend: extender `ReservasController` y `ReservaService`. La entidad `ReservaHabitacionEntity` ya existe.

Frontend: nuevo método `addHabitacion(reservaGuid, body)` y `removeHabitacion(reservaGuid, id)` en [reservas.ts](Frontend.Booking/src/services/reservas.ts). Vista admin de detalle de reserva debe usarlos.

### 5.7 Reservas — endpoint público

| Método | Ruta | Tag |
|---|---|---|
| POST | `/api/v1/public/reservas` | ReservasPublic |

DTOs: `CrearReservaPublicRequest`, `ClientePublicRequest`, `ReservaHabitacionPublicRequest`, `ReservaPublicDto`, `ReservaHabitacionPublicDto`.

Crea un cliente (si no existe por email/dni) + reserva confirmada, sin requerir login. Devuelve un código de reserva opaco.

Backend: nuevo `ReservasPublicController.cs` (carpeta `Controllers/V1/Public/`). Reusa `IReservaService` y `IClienteService`.

Frontend: el flujo "reservar como invitado" en marketplace ahora apunta a este endpoint en lugar de pedir login antes.

### 5.8 Roles ↔ Permisos

| Método | Ruta | Tag |
|---|---|---|
| POST | `/api/v1/internal/roles/{rolGuid}/permisos` | Roles |
| DELETE | `/api/v1/internal/roles/{rolGuid}/permisos/{idPermiso}` | Roles |

DTOs: `AssignPermisoRequest { idPermiso }`. Lista actual `GET /api/v1/internal/roles/{rolGuid}/permisos` ya existe.

Backend: agregar tabla pivot `rol_permiso` (si no existe), entidad `RolPermisoEntity`, repo, métodos en `RolService`.

> **Nota:** Hoy tienes `RolPermisosController.cs` separado — habría que consolidarlo dentro de `RolesController` siguiendo el patrón sub-recurso de la referencia.

### 5.9 Sucursales — imágenes y resumen rating

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/sucursales/{sucursalGuid}/resumen-rating` | Sucursales |
| GET | `/api/v1/internal/sucursales/{sucursalGuid}/imagenes` | Sucursales |
| POST | `/api/v1/internal/sucursales/{sucursalGuid}/imagenes` | Sucursales |
| DELETE | `/api/v1/internal/sucursales/{sucursalGuid}/imagenes/{idSucursalImagen}` | Sucursales |

DTOs: `SucursalImagenResponse`, `SucursalImagenResponseListApiResponse`, `CrearSucursalImagenRequest { url, ordenVisualizacion, esPrincipal }`.

Backend: **NUEVA ENTIDAD** `SucursalImagenEntity` con migración EF (`sucursal_imagen` con `id_sucursal_imagen`, `id_sucursal FK`, `url`, `orden_visualizacion`, `es_principal`, `fecha_creacion_utc`). Repo + servicio. `resumen-rating` agrega rating de valoraciones.

Frontend: vista `admin/sucursales/edit` necesita un componente de gestión de imágenes (subir vía `/images/upload`, asociar vía estos endpoints).

### 5.10 Tipos de habitación ↔ amenidades + imágenes

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/tipos-habitacion/{tipoHabitacionGuid}/amenidades` | TiposHabitacion |
| POST | `/api/v1/internal/tipos-habitacion/{tipoHabitacionGuid}/amenidades` | TiposHabitacion |
| DELETE | `/api/v1/internal/tipos-habitacion/{tipoHabitacionGuid}/amenidades/{id}` | TiposHabitacion |
| GET | `/api/v1/internal/tipos-habitacion/{tipoHabitacionGuid}/imagenes` | TiposHabitacion |
| POST | `/api/v1/internal/tipos-habitacion/{tipoHabitacionGuid}/imagenes` | TiposHabitacion |
| DELETE | `/api/v1/internal/tipos-habitacion/{tipoHabitacionGuid}/imagenes/{id}` | TiposHabitacion |

Backend:
- Amenidades: la entidad `TipoHabitacionCatalogoEntity` ya existe — confirmar si modela amenidades. Si no, crear `TipoHabitacionAmenidadEntity` con FK a `tipo_habitacion` y catálogo de servicio.
- Imágenes: `TipoHabitacionImagenEntity` ya existe. Solo exponerla.

DTOs nuevos: `AgregarImagenBody { url, ordenVisualizacion }`, `DeleteRequest`.

Frontend: vista `admin/tipos-habitacion/edit` con componentes de amenidades e imágenes.

### 5.11 Usuarios ↔ Roles

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/usuarios/{usuarioGuid}/roles` | Usuarios |
| POST | `/api/v1/internal/usuarios/{usuarioGuid}/roles` | Usuarios |
| DELETE | `/api/v1/internal/usuarios/{usuarioGuid}/roles/{idRol}` | Usuarios |

DTO: `AsignarRolRequest { rolGuid }`.

Backend: la entidad `UsuariosRolesEntity` ya existe. Solo exponerla en `UsuariosController` + `UsuarioService`.

Frontend: en `admin/usuarios/edit`, picker multi-select de roles que llama a estos endpoints.

### 5.12 Clientes — sub-recursos

| Método | Ruta | Tag |
|---|---|---|
| GET | `/api/v1/internal/clientes/{clienteGuid}/reservas` | Clientes |
| GET | `/api/v1/internal/clientes/{clienteGuid}/valoraciones` | Clientes |

Backend: queries en `ClienteService` que filtran por cliente. DTOs reutilizan `ReservaResponse` y `ValoracionResponse`.

### 5.13 Valoraciones — responder

| Método | Ruta | Tag |
|---|---|---|
| PATCH | `/api/v1/internal/valoraciones/{valoracionGuid}/responder` | Valoraciones |

DTO: `ResponderValoracionRequest { respuestaHotel, modificadoPorUsuario }`.

Backend: agregar columna `respuesta_hotel` y `fecha_respuesta_utc` a `valoracion` si no existen. Servicio + endpoint. Frontend: vista admin de valoraciones agrega un input de respuesta.

### 5.14 Accommodations — endpoint nuevo de categorías + reviews

Tu API ya tiene `GET /api/v1/accommodations/categories` y `GET /api/v1/accommodations/{sucursalGuid}/reviews` — confirmar shape contra `AccommodationCategoryDto` y `AccommodationReviewDto` del nuevo swagger. Probablemente requiere ajustes.

---

## 6. Renombre masivo de DTOs y schemas (Fase 5)

Mapeo completo (no exhaustivo en cada propiedad — los detalles internos también cambian; ver swaggerjj.json para el shape final):

### Wrappers
| Actual | Nuevo |
|---|---|
| `ApiResponse<T>` con `{ success, message, data, errors[] }` | `XxxApiResponse` con `{ data, success, message }` (sin `errors[]`) |
| `XxxDataPageResult` con `{ data[], pageNumber, pageSize, totalCount, totalPages }` | `XxxPaginatedResponse` con `{ items[], paginaActual, limite, totalResultados, totalPaginas, tieneSiguiente, tieneAnterior }` |
| `BooleanApiResponse` | `StringApiResponse` / `ObjectApiResponse` (boolean ya no se usa como wrapper) |
| (no existe) | `ApiErrorResponse { status, message, detail, errors{} }` (formato uniforme de error) |
| `ProblemDetails` (RFC 7807) | sigue existiendo pero como complemento — el wrapper estándar de error pasa a `ApiErrorResponse` |

### DTOs por entidad (renombre principal)
| Actual | Nuevo |
|---|---|
| `CatalogoServicioDTO` | `CatalogoResponse` |
| `CatalogoServicioUpsertRequest` | `CrearCatalogoRequest` + `ActualizarCatalogoRequest` (separar create/update) |
| `ClienteDTO` | `ClienteResponse` |
| `ClienteCreateRequest` | `CrearClienteRequest` |
| `ClienteUpdateRequest` | `ActualizarClienteRequest` |
| `EstadiaDTO` | `EstadiaResponse` |
| `EstadiaCheckinRequest` | `CheckinRequest` |
| `EstadiaCheckoutRequest` | `CheckoutRequest` |
| `FacturaDTO` | `FacturaResponse` |
| `FacturaCreateRequest` | `GenerarFacturaBody` |
| `FacturaUpdateRequest` | (eliminar) |
| `FacturaDetalleDTO` | `FacturaDetalleResponse` |
| `FacturaDetalleCreateRequest` | (no existe en referencia — facturas se generan vía SP) |
| `HabitacionDTO` | `HabitacionResponse` |
| `HabitacionCreateRequest` | `CrearHabitacionRequest` |
| `HabitacionUpdateRequest` | `ActualizarHabitacionRequest` |
| `HabitacionEstadoRequest` | `CambiarEstadoHabitacionRequest` |
| `HabitacionDetalleResponse` | (fusionar con `HabitacionResponse`) |
| `HabitacionPublicDto` | `HabitacionPublicListItemDto` |
| `PagoDTO` | `PagoResponse` |
| `PagoCreateRequest` | `CrearPagoRequest` |
| `PagoUpdateRequest` | `CambiarEstadoPagoBody` |
| `ReservaDTO` | `ReservaResponse` |
| `ReservaCreateRequest` | `CrearReservaRequest` |
| `ReservaUpdateRequest` | (eliminar — la actualización es vía sub-recurso habitaciones) |
| `ReservaHabitacionDTO` | `ReservaHabitacionResponse` |
| `ReservaHabitacionIdRequest` | (eliminar) |
| `CancelarReservaRequest` | `CancelarReservaBody` |
| `RolDTO` | `RolResponse` |
| `RolUpsertRequest` | `CrearRolRequest` (no hay ActualizarRol — solo create + asignar permisos) |
| `AsignarPermisosRequest` | `AssignPermisoRequest { idPermiso }` (singular, uno a la vez) |
| `SucursalDTO` | `SucursalResponse` |
| `SucursalUpsertRequest` | `CrearSucursalRequest` + `ActualizarSucursalRequest` |
| `SucursalPoliticasPatchRequest` | (mantiene su forma) |
| `SucursalPublicDto` | (eliminar — se reemplaza por `AccommodationDetailResponse` y `AccommodationSearchItemDto`) |
| `TarifaDTO` | `TarifaResponse` |
| `TarifaUpsertRequest` | `CrearTarifaRequest` + `ActualizarTarifaRequest` |
| `TipoHabitacionDTO` | `TipoHabitacionResponse` |
| `TipoHabitacionUpsertRequest` | `CrearTipoHabitacionRequest` + `ActualizarTipoHabitacionRequest` |
| `TipoHabitacionRef` | (referencia inline) |
| `TipoHabitacionPublicDto` | `AccommodationRoomTypeDto` |
| `UsuarioDTO` | `UsuarioResponse` |
| `UsuarioCreateRequest` | `CrearUsuarioRequest` |
| `UsuarioUpdateRequest` | `ActualizarUsuarioRequest` |
| `UsuarioCambiarPasswordRequest` | `CambiarPasswordRequest` (compartido) |
| `ValoracionDTO` | `ValoracionResponse` |
| `ValoracionCreateRequest` | `CrearValoracionRequest` |
| `ValoracionModerarRequest` | `ModerarValoracionRequest` |
| `ValoracionRespuestaRequest` | `ResponderValoracionRequest` |
| `AuditoriaEntity` | `AuditoriaResponse` |
| `InhabilitarRequest` | (eliminar — los `inhabilitar` son PATCH sin body o con body mínimo) |
| `CambiarPasswordResponse` | (eliminar — usar `StringApiResponse` o `ObjectApiResponse`) |
| `CargoEstadiaDTO` | `CargoEstadiaResponse` |
| `CargoEstadiaCreateRequest` | `CargoEstadiaRequest` |

### Carpetas DTO en backend (impacto directo)
- [Microservicio.HotelLuxemburgo.Business/DTOs/Auth/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Auth/) — reescribir login/refresh/cambiar-password.
- [DTOs/CatalogoServicios/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/CatalogoServicios/) — renombrar archivos.
- [DTOs/Cliente/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Cliente/) y `Clientes/` — consolidar (hoy hay dos carpetas).
- [DTOs/Estadias/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Estadias/), [Facturas/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Facturas/), [Habitaciones/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Habitaciones/), [Pagos/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Pagos/), [Reservas/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Reservas/), [Roles/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Roles/), [Sucursales/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Sucursales/), [Tarifas/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Tarifas/), [TiposHabitacion/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/TiposHabitacion/), [Usuarios/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Usuarios/), [Valoraciones/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Valoraciones/) — todas requieren renombre + reorganización create/update separados.
- [DTOs/Common/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Business/DTOs/Common/) — wrapper `ApiResponse<T>` queda; **NUEVO** `PaginatedResponse<T>` (reemplaza `DataPageResult<T>`); **NUEVO** `ApiErrorResponse`.

### Archivos de modelos en frontend (impacto directo)
- [src/models/api.types.ts](Frontend.Booking/src/models/api.types.ts) — definir `PaginatedResponse<T>` con `{ items, paginaActual, limite, totalResultados, totalPaginas, tieneSiguiente, tieneAnterior }`. Cambiar `ApiResponse<T>` a `{ data, success, message }` (sin `errors`). Agregar `ApiErrorResponse`.
- Cada `src/models/*.models.ts` — renombrar interfaces siguiendo la tabla de arriba y ajustar campos.
- [src/models/index.ts](Frontend.Booking/src/models/index.ts) — re-exportar nombres nuevos.

---

## 7. Cambios en validators

Backend: cada `Microservicio.HotelLuxemburgo.Business/Validators/Xxx*Validator.cs` que apunta a un DTO renombrado tiene que re-apuntar al nuevo nombre y revisar reglas si los campos cambian (p. ej., `userName` → `username`).

Lista de validators a revisar:
```
LoginRequestValidator
ClienteCreateValidator → CrearClienteValidator
ClienteUpdateValidator → ActualizarClienteValidator
ReservaCreateValidator → CrearReservaValidator
ReservaUpdateValidator → (eliminar)
SucursalUpsertValidator → split en CrearSucursalValidator + ActualizarSucursalValidator
HabitacionCreateValidator → CrearHabitacionValidator
HabitacionUpdateValidator → ActualizarHabitacionValidator
TarifaUpsertValidator → split
TipoHabitacionUpsertValidator → split
UsuarioCreateValidator → CrearUsuarioValidator
UsuarioUpdateValidator → ActualizarUsuarioValidator
ValoracionCreateValidator → CrearValoracionValidator
ValoracionModerarValidator → ModerarValoracionValidator
ValoracionRespuestaValidator → ResponderValoracionValidator
CatalogoServicioUpsertValidator → split
PagoCreateValidator → CrearPagoValidator
PagoUpdateValidator → CambiarEstadoPagoValidator
FacturaCreateValidator → GenerarFacturaValidator
FacturaUpdateValidator → (eliminar)
RolUpsertValidator → CrearRolValidator
EstadiaCheckinValidator → CheckinValidator
EstadiaCheckoutValidator → CheckoutValidator
CancelarReservaValidator → CancelarReservaBodyValidator
```

---

## 8. Cambios en entidades EF (Fase 6 — migraciones)

### Entidades NUEVAS
- `SucursalImagenEntity` (sub-recurso `/sucursales/{guid}/imagenes`).
- `RolPermisoEntity` (si no existe — pivot `rol_permiso`).
- Posible `TipoHabitacionAmenidadEntity` (si las amenidades no se modelan ya con `TipoHabitacionCatalogoEntity`).

### Entidades a EXTENDER
- `UsuarioAppEntity`: agregar `RefreshToken`, `RefreshTokenExpiresAt`.
- `EstadiaEntity`: agregar estado `EnMantenimiento` (si no existe en el enum/string).
- `ValoracionEntity`: agregar `RespuestaHotel`, `FechaRespuestaUtc`.
- `CargoEstadiaEntity`: agregar `MotivoAnulacion`, `FechaAnulacionUtc`.

### Tabla de migración (orden recomendado)
1. `AddRefreshTokenColumns` → `usuario_app`.
2. `AddSucursalImagen` → tabla nueva + FK.
3. `AddRolPermiso` → tabla nueva (si falta).
4. `AddTipoHabitacionAmenidad` → tabla nueva (si falta).
5. `ExtendValoracionRespuesta` → columnas.
6. `ExtendCargoEstadiaAnulacion` → columnas.
7. `ExtendEstadiaMantenimiento` → constraint del enum o tabla `estadia_estado`.

> **Riesgo:** si la base de datos ya tiene datos en producción/Railway, cada migración necesita un default seguro y/o un script de backfill.

---

## 9. Mapping de Controllers actual → objetivo

| Controller actual | Acción |
|---|---|
| `AccommodationsController.cs` | Mantener; revisar shapes contra `AccommodationDetailResponse`, `AccommodationSearchItemDto`. |
| `AlojamientosController.cs` | **ELIMINAR** (legacy). |
| `AuditoriaController.cs` | Mantener; renombrar params y DTOs. |
| `AuthController.cs` | Cambiar ruta a `/api/v1/auth`; eliminar `Me()`. |
| `CargosEstadiaController.cs` | Extender con `GET {cargoGuid}` y `PATCH {cargoGuid}/anular`. |
| `CatalogoServiciosController.cs` | Mantener; renombrar params y DTOs. |
| `ClienteController.cs` | Mantener; agregar `GET {clienteGuid}/reservas` y `GET {clienteGuid}/valoraciones`. |
| `EstadiasController.cs` | Mantener; agregar `PATCH {estadiaGuid}/mantenimiento`. |
| `FacturasController.cs` | Extender con `/reserva/{idReserva}`, `/{facturaGuid}/detalle`, `/final-y-pago-simulado/{reservaGuid}`, `/{facturaGuid}/pagos`. |
| `HabitacionesController.cs` | Extender con `/disponibles` y `/disponibilidad`. |
| `PagosController.cs` | Mantener; renombrar. |
| `PermisosController.cs` | Mantener (solo `GET /permisos`). |
| `Public/HabitacionesPublicController.cs` | Reemplazar por nuevo controller en `/api/v1/public/sucursales/{sucursalGuid}/habitaciones`. |
| `Public/RolesPublicController.cs` | **ELIMINAR**. |
| `Public/SucursalesPublicController.cs` | **ELIMINAR** (todo va en Accommodations). |
| `Public/TiposHabitacionPublicController.cs` | **ELIMINAR**. |
| `Public/UsuariosPublicController.cs` | **ELIMINAR**. |
| `ReservasController.cs` | Renombrar params; agregar sub-recurso `/{reservaGuid}/habitaciones`. |
| `RolPermisosController.cs` | **MERGE** dentro de `RolesController` siguiendo patrón sub-recurso. |
| `RolesController.cs` | Renombrar params; recibir endpoints de permisos. Eliminar `inhabilitar` si no está en referencia (verificar). |
| `SucursalesController.cs` | Renombrar params; agregar `/resumen-rating`, `/imagenes` (GET, POST, DELETE). |
| `TarifasController.cs` | Renombrar params; eliminar `/inhabilitar` si solo queda `/desactivar` (en referencia solo está `desactivar`). |
| `TiposHabitacionController.cs` | Renombrar params; agregar amenidades + imágenes sub-recursos. Eliminar `/inhabilitar`. |
| `UsuariosController.cs` | Renombrar params; agregar `/roles` sub-recurso; mantener `/cambiar-password`; eliminar `/cambiar-password` por usuario si referencia solo tiene el genérico (verificar — la referencia tiene `auth/cambiar-password`, no per-user). |
| `ValoracionesController.cs` | Renombrar params; agregar `/responder`. |
| (NUEVO) `ImagesController.cs` | Crear. |
| (NUEVO) `Public/ReservasPublicController.cs` | Crear. |

---

## 10. Mapping de servicios

| Service actual | Acción |
|---|---|
| `AlojamientoService.cs` / `IAlojamientoService.cs` | **ELIMINAR**. |
| `CatalogoServiciosService.cs` | Renombrar DTOs internos. |
| `ClienteService.cs` | Agregar `ObtenerReservasDelCliente(Guid)`, `ObtenerValoracionesDelCliente(Guid)`. |
| `EstadiaService.cs` | Agregar `MarcarMantenimiento(Guid)`, `ObtenerCargo(Guid)`, `AnularCargo(Guid, string)`. |
| `FacturaService.cs` | Agregar `GenerarFinalYPagoSimulado(Guid)`, `ObtenerDetalleFactura(Guid)`, `ObtenerPagosDeFactura(Guid)`, `ObtenerPorReserva(int idReserva)`. |
| `HabitacionService.cs` | Agregar `ObtenerDisponibles(filtros)`, `ObtenerDisponibilidad(filtros)`. |
| `PagoService.cs` | Renombrar DTOs internos. |
| `PerfilAgenteService.cs` | Verificar si sigue siendo relevante; el swagger de referencia no expone perfiles. Posible **ELIMINACIÓN**. |
| `ResenaService.cs` | Renombrar a `ValoracionService` para consistencia (o mantener ambos nombres si se usa en muchos lugares). Agregar `Responder(Guid, body)`. |
| `ReservaService.cs` | Agregar `AgregarHabitacion(Guid, body)`, `EliminarHabitacion(Guid, int)`, `CrearPublica(body)`. |
| `RolService.cs` | Agregar `AsignarPermiso(Guid rolGuid, string idPermiso)`, `QuitarPermiso(Guid rolGuid, string idPermiso)`, `ObtenerPermisos(Guid rolGuid)`. |
| `SucursalService.cs` | Agregar `ObtenerResumenRating(Guid)`, `ListarImagenes(Guid)`, `AgregarImagen(Guid, body)`, `EliminarImagen(Guid, int)`. |
| `TarifaService.cs` | Renombrar DTOs internos. Mantener solo `Desactivar`. |
| `TipoHabitacionService.cs` | Agregar amenidades CRUD + imágenes CRUD. |
| `UsuarioService.cs` | Agregar `ObtenerRoles(Guid)`, `AsignarRol(Guid usuarioGuid, Guid rolGuid)`, `QuitarRol(Guid usuarioGuid, int idRol)`. Adaptar login/refresh con refresh token. |
| (NUEVO) `IImageStorageService` / `ImageStorageService` | Crear. |

---

## 11. Mapping de servicios frontend

| Service actual | Acción |
|---|---|
| [accommodations.ts](Frontend.Booking/src/services/accommodations.ts) | Mantener; revisar tipos contra DTOs nuevos. |
| [alojamientos.ts](Frontend.Booking/src/services/alojamientos.ts) | **ELIMINAR**. |
| [auditoria.ts](Frontend.Booking/src/services/auditoria.ts) | Renombrar tipos. |
| [catalogo.ts](Frontend.Booking/src/services/catalogo.ts) | Eliminar llamada a `/publico`. Renombrar tipos. |
| [clientes.ts](Frontend.Booking/src/services/clientes.ts) | Agregar `getReservas(clienteGuid)`, `getValoraciones(clienteGuid)`. |
| [estadias.ts](Frontend.Booking/src/services/estadias.ts) | Agregar `marcarMantenimiento(estadiaGuid)`, `getCargo(cargoGuid)`, `anularCargo(cargoGuid, motivo)`. |
| [facturas.ts](Frontend.Booking/src/services/facturas.ts) | Agregar `getDetalle(facturaGuid)`, `getPagos(facturaGuid)`, `getPorReserva(idReserva)`, `generarFinalYPago(reservaGuid)`. |
| [habitaciones.ts](Frontend.Booking/src/services/habitaciones.ts) | Eliminar `/publico`. Agregar `getDisponibles(filtros)`, `getDisponibilidad(filtros)`. |
| [pagos.ts](Frontend.Booking/src/services/pagos.ts) | Renombrar tipos. |
| [reservas.ts](Frontend.Booking/src/services/reservas.ts) | Agregar `addHabitacion`, `removeHabitacion`, `crearPublica`. |
| [roles.ts](Frontend.Booking/src/services/roles.ts) | Agregar `assignPermiso(rolGuid, idPermiso)`, `removePermiso(rolGuid, idPermiso)`, `getPermisos(rolGuid)`. Reemplazar `/activos`. |
| [sucursales.ts](Frontend.Booking/src/services/sucursales.ts) | Eliminar `/publico`. Agregar `getResumenRating`, `getImagenes`, `addImagen`, `removeImagen`. |
| [tarifas.ts](Frontend.Booking/src/services/tarifas.ts) | Renombrar tipos. |
| [tiposHabitacion.ts](Frontend.Booking/src/services/tiposHabitacion.ts) | Eliminar `/publico`. Agregar amenidades + imágenes. |
| [usuarios.ts](Frontend.Booking/src/services/usuarios.ts) | Eliminar `/publico`. Agregar `getRoles`, `assignRol`, `removeRol`. Eliminar `cambiar-password` per-user (movido a auth). |
| [valoraciones.ts](Frontend.Booking/src/services/valoraciones.ts) | Eliminar `/publicas`. Agregar `responder(valoracionGuid, body)`. |
| (NUEVO) `images.ts` | Crear con `uploadImage(file)`. |

---

## 12. Cambios en vistas (frontend)

Áreas afectadas:
- [src/views/auth/](Frontend.Booking/src/views/auth/) — login form usa `username` (no `userName`); persistir `LoginResponse` completo.
- [src/views/marketplace/](Frontend.Booking/src/views/marketplace/) — flujos de búsqueda/listado contra `/api/v1/accommodations/*` (probablemente ya OK), checkout público contra `/api/v1/public/reservas`.
- [src/views/admin/](Frontend.Booking/src/views/admin/) — todas las vistas list/edit:
  - `clientes/` — agregar tabs "Reservas" y "Valoraciones".
  - `sucursales/edit` — agregar gestión de imágenes (componente upload + lista) y resumen-rating.
  - `tipos-habitacion/edit` — agregar amenidades + imágenes.
  - `habitaciones/` — eliminar tab/links `/publico`.
  - `usuarios/edit` — multi-select de roles.
  - `roles/edit` — multi-select de permisos (vía sub-recurso).
  - `valoraciones/edit` — input "Responder".
  - `estadias/edit` — botón "Mantenimiento", lista de cargos con acción "Anular".
  - `facturas/edit` — tab de detalle, tab de pagos, botón "Cierre simulado con pago".
  - `reservas/edit` — gestión de habitaciones (add/remove sin recrear la reserva).
- [src/views/reservations/](Frontend.Booking/src/views/reservations/) — flujo "mis-reservas" filtrado por cliente actual usa `/clientes/{clienteGuid}/reservas`.

---

## 13. Cambios en `Program.cs` y middleware

- [Program.cs](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Program.cs): registrar `IImageStorageService`, posiblemente `IRolPermisoService`. Configurar Swagger con tags y descripciones del nuevo contrato.
- [Middleware/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Middleware/): unificar manejador de excepciones para emitir `ApiErrorResponse` (en lugar de o junto con `ProblemDetails`).
- [Extensions/](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Extensions/): si hay un `AddSwaggerGen` custom, ajustar nombres de schemas y tags.

---

## 14. Otros archivos del backend

- [Booking.Api.manual-tests.http](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Booking.Api.manual-tests.http) — actualizar todas las URLs.
- [Booking.Api.smoke-test-results.json](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Booking.Api.smoke-test-results.json) — rerun después de migrar.
- [Booking.Api.swagger-request-reference.md](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Booking.Api.swagger-request-reference.md) — regenerar después.
- [Microservicio.Clientes.Api.http](Microservicio.Booking/Microservicio.HotelLuxemburgo.Api/Microservicio.Clientes.Api.http) — actualizar.

---

## 15. Plan de fases sugerido (cuando vayas a ejecutar)

| Fase | Alcance | Duración estimada | Bloquea a |
|---|---|---|---|
| 0 | Crear branch `migrate-to-reference-swagger`. Backup BD. | 0.5h | — |
| 1 | Auth (rutas, DTOs, refresh token, eliminar `/me`). Frontend stores y http.ts. | 4-6h | Todo lo demás |
| 2 | Renombre wrappers (`ApiResponse` → ya está; `DataPageResult` → `PaginatedResponse`; agregar `ApiErrorResponse`). | 3-4h | Fase 5 |
| 3 | Renombre params de ruta `{guid}` → `{xxxGuid}` en todos los controllers + actions. | 2-3h | — |
| 4 | Eliminar endpoints `/publico` paralelos + controller legacy `Alojamientos`. | 2-3h | — |
| 5 | Renombre masivo de DTOs (entidad por entidad: backend → frontend type → service → vista). | 12-16h | — |
| 6 | Migraciones EF (`SucursalImagenEntity`, `RolPermisoEntity`, refresh tokens, valoración respuesta, etc.). | 3-4h | Fase 7 |
| 7 | Endpoints nuevos por entidad (cargos, mantenimiento, facturas extendidas, disponibilidad, imágenes upload, sucursal imágenes, tipo-habitación amenidades+imágenes, usuario↔roles, rol↔permisos, reserva↔habitaciones, reserva pública, valoración responder, cliente sub-recursos). | 16-24h | — |
| 8 | Vistas frontend nuevas para los endpoints nuevos. | 8-12h | — |
| 9 | Smoke tests + ajustes de validators + regenerar `swagger.json`. | 3-4h | — |

**Total estimado: 50-75 horas de trabajo.**

---

## 16. Riesgos y advertencias

1. **Datos existentes en BD.** Migraciones que renombran columnas o agregan FK NOT NULL pueden fallar. Cada migración necesita default + backfill. Hacer backup antes.
2. **Endpoints de SP.** "Final y pago simulado" depende de un stored procedure que probablemente no existe en tu BD; revisar el repo de tu compañero o el script SQL que les dio el profe.
3. **El frontend va a romper en producción.** Vercel build pasará type-check pero los endpoints no responderán hasta que el backend esté migrado. Coordinar deploys.
4. **Refresh tokens.** Si añades refresh tokens, cualquier sesión activa actual se invalida al desplegar (los JWT viejos no traen refresh). Anunciarlo.
5. **Tags y nombres en Swagger.** El swagger de referencia tiene descripciones puntuales por tag (`Auditoria`, `Facturas`, `HabitacionesPublic`, `ReservasPublic`, `Roles`, etc.). Replicar las descripciones en `[ApiExplorerSettings]` o `[Tags]` por controller.
6. **Tests.** El proyecto [Microservicio.HotelLuxemburgo.Tests](Microservicio.Booking/Microservicio.HotelLuxemburgo.Tests/) — todos los tests que validen DTOs viejos romperán. Habrá que reescribirlos junto con la fase correspondiente.
7. **CLAUDE.md desactualizado.** Después de migrar, [Frontend.Booking/CLAUDE.md](Frontend.Booking/CLAUDE.md) menciona estructuras (`booking.idClienteOverride`, `userContext` llamando a `/me`) que ya no existen. Actualizarlo en la fase 1.

---

## 17. Qué NO migrar

- `swagger.json` no se edita a mano: se regenera al construir el backend (Swashbuckle). La validación final es: tras todas las fases, comparar el `swagger.json` regenerado contra `swaggerjj.json` con un diff JSON.
- El proyecto `Microservicio.HotelLuxemburgo.DataManagment` parece tener `Validators/` y `UnitOfWork/` propios — confirmar si es código legacy duplicado o realmente se usa. Si está obsoleto, eliminarlo en una fase de limpieza posterior (no crítica).

---

> **Siguiente paso recomendado.** Cuando me confirmes este DIFF, podemos arrancar por Fase 1 (Auth) en una sesión nueva, commiteando al final de cada sub-fase. Así el repo nunca queda más de unas horas en estado roto.
