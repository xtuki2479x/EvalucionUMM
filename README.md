# Mi Espacio Esotérico

Aplicación web de servicios esotéricos con catálogo, carrito, chat,
registro e inicio de sesión. El backend usa arquitectura MVC, sesiones
reales y persistencia SQLite para usuarios, órdenes y mensajes.

## Tecnologías

- HTML5, CSS3 y JavaScript.
- Node.js y Express.
- SQLite mediante `node:sqlite`.
- `express-session` para las sesiones.
- `bcryptjs` para proteger contraseñas.
- `node:test` para pruebas automáticas.

## Requisitos

- Node.js 22.5 o superior.
- npm.

## Instalación y ejecución

```powershell
npm install
npm start
```

Abrir:

```text
http://localhost:3000
```

La aplicación debe abrirse desde el servidor. Abrir `index.html`
directamente impide que las llamadas a la API funcionen.

Usuario incluido para demostración:

```text
Correo: demo@espacio.cl
Contraseña: Demo1234
```

También se pueden crear usuarios desde el formulario de registro.

## Pruebas

```powershell
npm test
```

Las pruebas usan una base SQLite en memoria y comprueban registro,
validaciones, login, sesión, logout, rutas protegidas y persistencia de
órdenes y mensajes.

## Arquitectura MVC

```text
backend/
  app.js
  server.js
  database.js
  routes/
    authRoutes.js
    orderRoutes.js
    messageRoutes.js
  controllers/
    authController.js
    orderController.js
    messageController.js
  models/
    userModel.js
    orderModel.js
    messageModel.js
  middlewares/
    authMiddleware.js
```

- **Routes:** declaran endpoints y conectan middlewares/controladores.
- **Controllers:** validan solicitudes y construyen respuestas HTTP.
- **Models:** realizan consultas y transacciones SQLite.
- **Middlewares:** verifican que exista una sesión válida.
- **app.js:** configura Express, sesiones, dependencias y rutas.

## Base de datos

El esquema está definido en `database.sql` y contiene:

- `usuarios`
- `ordenes`
- `orden_detalle`
- `mensajes`

El archivo local se genera en `data/app.db` y está excluido de Git. Las
contraseñas se almacenan como hashes de bcrypt, nunca como texto plano.

## Rutas disponibles

### Autenticación

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Crea usuario e inicia sesión. |
| `POST` | `/api/auth/login` | No | Verifica email y contraseña. |
| `POST` | `/api/auth/logout` | No | Destruye la sesión actual. |
| `GET` | `/api/auth/me` | Sí | Devuelve el usuario autenticado. |

### Órdenes

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/orders` | Sí | Guarda carrito y detalle. |
| `GET` | `/api/orders` | Sí | Lista órdenes del usuario. |

### Mensajes

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/messages` | Sí | Guarda un mensaje. |
| `GET` | `/api/messages` | Sí | Lista mensajes del usuario. |

Las rutas marcadas con autenticación usan `requireAuth` y responden
`401` cuando no existe `req.session.usuario`.

## Seguridad y sesiones

- Cookie de sesión HTTP-only.
- Validación de datos en frontend y backend.
- Contraseñas con bcrypt.
- Email único en SQLite.
- Usuarios inactivos no pueden iniciar sesión.
- El hash de contraseña nunca se devuelve al navegador.
- El carrito y el chat requieren una sesión confirmada por el backend.

`localStorage` se mantiene para catálogo, carrito pendiente y apoyo
visual. No es la fuente de autorización ni registra compras o mensajes
confirmados.

## Mejoras implementadas por Integrante 2

1. Reorganización del backend con arquitectura MVC.
2. Registro, login, logout y consulta de sesión real.
3. Middleware `requireAuth`.
4. Persistencia SQLite de órdenes y detalles.
5. Persistencia SQLite de mensajes.
6. Integración del carrito y chat con rutas protegidas.
7. Ampliación de pruebas automáticas.
8. Corrección del esquema MySQL anterior a SQLite.

Más detalles: `docs/mejoras_integrante_2.md`.

## Producción

Antes de publicar se debe configurar `SESSION_SECRET`, usar HTTPS y
reemplazar el almacén en memoria de `express-session` por uno
persistente.
